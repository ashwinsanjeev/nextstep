// const OpenAI = require('openai');
// const openai = new OpenAI(process.env.OPENAI_API_KEY);

// exports.extractSkills = async (resumeText) => {
//   const prompt = `
//   Analyze the following resume and extract the technical and professional skills.
//   Return only a JSON array of skills without any additional commentary.
  
//   Resume:
//   ${resumeText.substring(0, 3000)} // Limit to avoid token limits
//   `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       { role: "system", content: "You are a helpful resume analyzer that extracts skills in JSON format." },
//       { role: "user", content: prompt }
//     ],
//     response_format: { type: "json_object" }
//   });

//   return JSON.parse(response.choices[0].message.content).skills;
// };

// exports.extractExperience = async (resumeText) => {
//   const prompt = `
//   Analyze the following resume and extract work experience including:
//   - Job titles
//   - Companies
//   - Duration
//   - Key responsibilities
  
//   Return in JSON format with this structure:
//   {
//     "experience": [
//       {
//         "title": "",
//         "company": "",
//         "duration": "",
//         "responsibilities": []
//       }
//     ]
//   }
  
//   Resume:
//   ${resumeText.substring(0, 3000)}
//   `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       { role: "system", content: "You extract work experience from resumes in JSON format." },
//       { role: "user", content: prompt }
//     ],
//     response_format: { type: "json_object" }
//   });

//   return JSON.parse(response.choices[0].message.content).experience;
// };


const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Cheaper model configuration
const CHEAP_MODEL = "gpt-3.5-turbo";
const MAX_TOKENS = 300; // Reduce response length
const MAX_INPUT_TOKENS = 1000; // Limit input size

exports.extractSkills = async (resumeText) => {
  try {
    const shortenedText = resumeText.substring(0, MAX_INPUT_TOKENS);
    
    const response = await openai.chat.completions.create({
      model: CHEAP_MODEL,
      messages: [
        { 
          role: "system", 
          content: "Extract ONLY technical skills as a JSON array. Example: {skills: ['Python', 'React']}" 
        },
        { 
          role: "user", 
          content: `Extract skills from: ${shortenedText}` 
        }
      ],
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
      temperature: 0.3 // More deterministic output
    });

    return JSON.parse(response.choices[0].message.content).skills || [];
  } catch (error) {
    console.error("OpenAI Error (skills):", error.message);
    return []; // Return empty array instead of failing
  }
};

exports.extractExperience = async (resumeText) => {
  try {
    const shortenedText = resumeText.substring(0, MAX_INPUT_TOKENS);
    
    const response = await openai.chat.completions.create({
      model: CHEAP_MODEL,
      messages: [
        {
          role: "system",
          content: `Extract work experience in this JSON format: {
            experience: [{
              title: string,
              company: string,
              duration: string,
              responsibilities: string[]
            }]
          }`
        },
        { 
          role: "user", 
          content: `Extract from: ${shortenedText}` 
        }
      ],
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content).experience || [];
  } catch (error) {
    console.error("OpenAI Error (exp):", error.message);
    return []; // Return empty array instead of failing
  }
};