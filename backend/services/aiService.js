const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

/**
 * THE SINGLE REQUIRED TOOL: search_hotels()
 * Searches the existing hotel and room database.
 * The AI must never invent hotel names, room availability, prices, or ratings.
 */
const search_hotels = async ({ location = '', guests = 1, maxPrice = null, roomType = '' } = {}) => {
  try {
    let hotelQuery = {};

    if (location && location.trim() !== '') {
      const loc = location.trim();
      hotelQuery.$or = [
        { location: { $regex: loc, $options: 'i' } },
        { hotelName: { $regex: loc, $options: 'i' } },
        { address: { $regex: loc, $options: 'i' } },
      ];
    }

    const hotels = await Hotel.find(hotelQuery);

    if (hotels.length === 0) {
      return {
        found: false,
        message: `No hotels found in database matching location "${location}".`,
        results: [],
      };
    }

    const hotelIds = hotels.map((h) => h._id);

    // Build room query
    let roomQuery = {
      hotelId: { $in: hotelIds },
      status: 'Available', // Only actual available rooms
    };

    if (guests && Number(guests) > 0) {
      roomQuery.capacity = { $gte: Number(guests) };
    }

    if (maxPrice && Number(maxPrice) > 0) {
      roomQuery.pricePerNight = { $lte: Number(maxPrice) };
    }

    if (roomType && roomType.trim() !== '' && roomType.toLowerCase() !== 'all') {
      roomQuery.roomType = { $regex: roomType.trim(), $options: 'i' };
    }

    const rooms = await Room.find(roomQuery)
      .populate('hotelId', 'hotelName location address rating image contactPhone')
      .sort({ pricePerNight: 1 });

    if (rooms.length === 0) {
      return {
        found: false,
        message: `Found hotels in "${location}", but no available rooms match ${guests} guest(s) within budget ${maxPrice ? '$' + maxPrice : 'any'}.`,
        hotelsAvailable: hotels.map((h) => ({
          hotelId: h._id,
          hotelName: h.hotelName,
          location: h.location,
          rating: h.rating,
        })),
        results: [],
      };
    }

    // Format real database results for AI response
    const results = rooms.map((r) => ({
      hotelId: r.hotelId._id,
      hotelName: r.hotelId.hotelName,
      location: r.hotelId.location,
      address: r.hotelId.address,
      rating: r.hotelId.rating,
      hotelImage: r.hotelId.image,
      roomId: r._id,
      roomNumber: r.roomNumber,
      roomType: r.roomType,
      capacity: r.capacity,
      pricePerNight: r.pricePerNight,
      amenities: r.amenities,
      status: r.status,
      roomImage: r.image,
    }));

    return {
      found: true,
      count: results.length,
      results,
    };
  } catch (error) {
    console.error('search_hotels tool error:', error);
    return { found: false, error: error.message, results: [] };
  }
};

/**
 * Intelligent Tanglish / Natural Language Entity Extractor
 * Handles queries like: "Coimbatore-la 2 people-ku ₹2500 budget-la room venum."
 * Extracting:
 *   Location → Coimbatore
 *   Guests → 2
 *   Budget → 2500
 */
const extractSearchParameters = (message) => {
  const text = message.toLowerCase();
  let location = '';
  let guests = 2;
  let maxPrice = null;

  // 1. Extract Budget (e.g. ₹2500, Rs 2500, INR 2500, $250, 2500 budget, budget 2500)
  const budgetMatch =
    text.match(/(?:₹|rs\.?|inr|\$)\s*(\d+)/i) ||
    text.match(/(\d+)\s*(?:budget|price|rs|inr|rupees|dollars)/i) ||
    text.match(/(?:budget|under|below|max|around)\s*(?:of\s*)?(?:₹|rs\.?|\$)?\s*(\d+)/i);

  if (budgetMatch && budgetMatch[1]) {
    maxPrice = Number(budgetMatch[1]);
  }

  // 2. Extract Guests (e.g. 2 people, 2 guests, 2-ku, 3 adults, 1 person)
  const guestsMatch =
    text.match(/(\d+)\s*(?:people|persons?|guests?|adults?|members?)/i) ||
    text.match(/(\d+)\s*-\s*(?:ku|kku|person|people)/i) ||
    text.match(/(?:for|for\s*about)\s*(\d+)\s*(?:people|persons?|guests?)?/i);

  if (guestsMatch && guestsMatch[1]) {
    guests = Number(guestsMatch[1]);
  }

  // 3. Extract Location
  // Check known cities first
  const knownCities = [
    'coimbatore', 'miami', 'new york', 'aspen', 'honolulu', 'scottsdale',
    'lake tahoe', 'chennai', 'bangalore', 'goa', 'mumbai', 'delhi', 'paris', 'dubai'
  ];

  for (const city of knownCities) {
    if (text.includes(city)) {
      location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // If not in known list, check Tamil/Tanglish suffix "-la" or "in <location>"
  if (!location) {
    const locMatch =
      text.match(/([a-zA-Z]+)(?:-la|-il|-la\s|la\b)/i) ||
      text.match(/(?:in|at|near|around)\s+([a-zA-Z\s]+?)(?:\s+(?:for|with|under|\d|hotel|room)|$)/i);

    if (locMatch && locMatch[1]) {
      const candidate = locMatch[1].trim();
      if (!['room', 'hotel', 'people', 'budget', 'need'].includes(candidate.toLowerCase())) {
        location = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }

  return { location, guests, maxPrice };
};

/**
 * AI Assistant Chat Handler with LangChain + Groq & Safe Infallible Fallback
 */
const askAIAssistant = async (userMessage, conversationHistory = []) => {
  const { location, guests, maxPrice } = extractSearchParameters(userMessage);

  // Execute the single search_hotels() tool using actual database
  const toolResults = await search_hotels({
    location,
    guests,
    maxPrice,
  });

  // Try LangChain Groq if GROQ_API_KEY is configured
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    try {
      const { ChatGroq } = require('@langchain/groq');
      const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

      const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
      });

      const systemPrompt = `You are TAKKUNU BOOKU's AI Concierge.
You must ONLY present rooms and hotels found in the database tool output provided below.
DO NOT hallucinate or invent hotels, room numbers, prices, or ratings.
Answer helpfully and concisely. If the user spoke in Tanglish or Tamil, you can reply in friendly English with a polite welcoming touch.

DATABASE SEARCH RESULTS:
${JSON.stringify(toolResults, null, 2)}`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ]);

      return {
        reply: response.content,
        hotels: toolResults.results,
        extractedParams: { location, guests, maxPrice },
        toolResults,
      };
    } catch (groqError) {
      console.warn('LangChain Groq API call failed or quota exceeded. Falling back to local response generation:', groqError.message);
    }
  }

  // Fallback Generation: Produces natural, accurate text from the REAL database results
  let reply = '';
  if (toolResults.found && toolResults.results.length > 0) {
    const r = toolResults.results[0];
    reply = `Vanakkam! Based on your request for ${location ? `**${location}**` : 'our properties'} for **${guests} guests**${maxPrice ? ` under **₹/$${maxPrice}**` : ''}, I found **${toolResults.results.length} available room(s)** in our database!

🏨 **${r.hotelName}** (${r.location})
• **Room:** #${r.roomNumber} (${r.roomType} Suite)
• **Rate:** **$${r.pricePerNight} / night** (Fits up to ${r.capacity} guests)
• **Guest Rating:** ⭐ ${r.rating} / 5.0
• **Key Amenities:** ${r.amenities.slice(0, 4).join(', ')}

You can view the full details and reserve this room directly below!`;
  } else if (toolResults.hotelsAvailable && toolResults.hotelsAvailable.length > 0) {
    const h = toolResults.hotelsAvailable[0];
    reply = `I found **${h.hotelName}** in **${h.location}**, but no rooms currently match ${guests} guest(s) within $${maxPrice || 'the budget'}. Would you like to check other room categories or dates?`;
  } else {
    reply = `I searched our database for hotels in **"${location || 'your destination'}"**, but couldn't find matching available rooms. We have luxury resorts in Miami, New York, Aspen, Honolulu, and Lake Tahoe. Would you like to explore those?`;
  }

  return {
    reply,
    hotels: toolResults.results,
    extractedParams: { location, guests, maxPrice },
    toolResults,
  };
};

module.exports = {
  search_hotels,
  extractSearchParameters,
  askAIAssistant,
};
