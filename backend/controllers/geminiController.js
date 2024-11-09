// controllers/geminiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to validate questions
const validateQuestions = (questions) => {
  return questions.map((q, index) => ({
    id: q.id || index + 1,
    text: q.text,
    options: q.options.slice(0, 4), // Ensure exactly 4 options
    correctAnswer: q.correctAnswer,
    level: q.level || Math.floor(index / 5) + 1
  }));
};

// Helper function to sort questions
const sortQuestions = (questions) => {
  return questions.sort((a, b) => {
    if (a.level === b.level) {
      return a.id - b.id;
    }
    return a.level - b.level;
  });
};

// Fallback questions in case of API failure
const getFallbackQuestions = () => {
  return [
    {
      id: 1,
      text: "What is 'Hello' in Spanish?",
      options: ["Hola", "Bonjour", "Ciao", "Hallo"],
      correctAnswer: "Hola",
      level: 1
    },
    {
      id: 2,
      text: "What is 'Food' in Spanish?",
      options: ["Nourriture", "Comida", "Cibo", "Essen"],
      correctAnswer: "Comida",
      level: 1
    }
  ];
};

const generateQuestions = async (req, res) => {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Structure the prompt for better results
    const structuredPrompt = `
    Generate an array of Spanish language learning questions. Each question should follow this exact JSON structure:
    {
      id: number,
      text: string (Spanish question),
      options: string[] (4 options),
      correctAnswer: string (one of the options),
      level: number (1-5)
    }

    Requirements:
    - Generate exactly 25 questions (5 questions per level, levels 1-5)
    - Questions should progress in difficulty according to DELE certification levels
    - Level 1-2: Basic (A1-A2)
    - Level 3-4: Intermediate (B1-B2)
    - Level 5: Advanced (C1)
    - All questions must be in valid JSON format
    - Each question must have exactly 4 options
    - The correctAnswer must be one of the options
    - Return the result as a valid JSON array

    Format the response as:
    {
      "questions": [
        // 25 questions here
      ]
    }`;

    // Generate response from Gemini
    const result = await model.generateContent(structuredPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract and process questions
    let questions;
    try {
      // Find the JSON array in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsedResponse.questions) || parsedResponse.questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      // Validate and sort questions
      questions = validateQuestions(parsedResponse.questions);
      questions = sortQuestions(questions);

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      // Use fallback questions if parsing fails
      questions = getFallbackQuestions();
    }

    // Return success response
    return res.status(200).json({
      success: true,
      questions,
      message: 'Questions generated successfully'
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return error response with fallback questions
    return res.status(500).json({
      success: false,
      questions: getFallbackQuestions(),
      message: 'Error generating questions. Using fallback questions.',
      error: error.message || 'Unknown error occurred'
    });
  }
};

// Route handler for Express
const handleGeminiRequest = async (req, res) => {
  // Check request method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    await generateQuestions(req, res);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  handleGeminiRequest
};