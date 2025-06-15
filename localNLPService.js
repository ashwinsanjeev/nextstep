const natural = require('natural');
const nlp = require('compromise');
const { Tagger } = require('pos');

// Enhanced skills database with categories
const SKILLS_DB = {
  technical: [
    'javascript', 'python', 'react', 'node.js', 'express', 'mongodb',
    'sql', 'aws', 'docker', 'typescript', 'html', 'css', 'git'
  ],
  soft: [
    'communication', 'teamwork', 'leadership', 'problem solving',
    'time management', 'adaptability', 'critical thinking'
  ]
};


// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const tagger = new Tagger();

exports.extractSkills = (text) => {
  const taggedWords = tagger.tag(tokenizer.tokenize(text));
  const nouns = taggedWords.filter(([_, tag]) => tag.startsWith('NN')).map(([word]) => word.toLowerCase());
  const adjectives = taggedWords.filter(([_, tag]) => tag.startsWith('JJ')).map(([word]) => word.toLowerCase());

  const foundSkills = [
    ...matchSkills(text, SKILLS_DB.technical, 'technical'),
    ...matchSkills(text, SKILLS_DB.soft, 'soft')
  ];

    return foundSkills.map(item => item.skill || item);

};

function matchSkills(text, skills, type) {
  return skills.filter(skill => {
    const skillWords = skill.toLowerCase().split(' ');
    return skillWords.every(word => 
      text.toLowerCase().includes(word) ||
      text.toLowerCase().includes(stemmer.stem(word))
    );
  }).map(skill => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    type,
    confidence: 'high'
  }));
}

exports.extractExperience = (text) => {
  const doc = nlp(text);
  const experiences = [];

  // Extract using enhanced patterns
  const patterns = [
    { pattern: '#JobTitle at #Organization', reverse: false },
    { pattern: 'worked as #JobTitle at #Organization', reverse: false },
    { pattern: '#Organization, #JobTitle', reverse: true }
  ];

  patterns.forEach(({pattern, reverse}) => {
    const matches = doc.match(pattern);
    matches.forEach(m => {
      const title = reverse 
        ? m.groups('JobTitle')?.text() || 'Professional Role'
        : m.groups('JobTitle')?.text() || 'Professional Role';
      
      const company = reverse
        ? m.groups('Organization')?.text() || 'Various Companies'
        : m.groups('Organization')?.text() || 'Various Companies';

      experiences.push({
        company,
        title,
        duration: extractDuration(m.text())
      });
    });
  });

  return experiences.length > 0 
    ? experiences 
    : [{ company: 'Various Companies', title: 'Professional Experience', duration: '' }];
};