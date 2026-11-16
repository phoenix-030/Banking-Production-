/**
 * Canonical Banking Exam Syllabus Registry
 * Covers standard Indian Banking Recruitment examinations:
 * IBPS (PO, Clerk, RRB PO, RRB Clerk, SO)
 * SBI (PO, Clerk, SO)
 * RBI (Grade B, Assistant)
 * NABARD (Grade A, Grade B)
 * Other Financial Institutions (IDBI, SIDBI, ECGC, EXIM, IIFCL)
 */

export const BANKING_SYLLABUS = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude / Numerical Ability',
    shortName: 'Quantitative Aptitude',
    matchKeywords: ['quant', 'numerical', 'math', 'arithmetic', 'data analysis', 'quantitative'],
    topics: [
      { name: 'Number System' },
      { name: 'Simplification & Approximation' },
      { name: 'Percentage' },
      { name: 'Ratio & Proportion' },
      { name: 'Average' },
      { name: 'Profit & Loss' },
      { name: 'Simple Interest' },
      { name: 'Compound Interest' },
      { name: 'Time & Work' },
      { name: 'Pipes & Cisterns' },
      { name: 'Time, Speed & Distance' },
      { name: 'Boats & Streams' },
      { name: 'Mixture & Alligation' },
      { name: 'Partnership' },
      { name: 'Problems on Ages' },
      { name: 'Probability' },
      { name: 'Permutation & Combination' },
      {
        name: 'Data Interpretation',
        subtopics: [
          'Table DI',
          'Bar Graph',
          'Line Graph',
          'Pie Chart',
          'Caselet DI',
          'Missing DI',
          'Radar / Web DI',
        ],
      },
      { name: 'Data Sufficiency' },
    ],
  },
  {
    id: 'reasoning',
    name: 'Reasoning Ability',
    shortName: 'Reasoning Ability',
    matchKeywords: ['reason', 'logic', 'mental ability', 'aptitude & reasoning'],
    topics: [
      {
        name: 'Puzzles',
        subtopics: ['Box Puzzle', 'Floor & Flat Puzzle', 'Day / Month / Year Puzzle', 'Scheduling Puzzle'],
      },
      {
        name: 'Seating Arrangement',
        subtopics: ['Circular Arrangement', 'Linear Arrangement', 'Parallel Rows', 'Square / Rectangular', 'Uncertain Number of Persons'],
      },
      { name: 'Syllogism' },
      { name: 'Inequality' },
      { name: 'Coding-Decoding' },
      { name: 'Blood Relations' },
      { name: 'Direction & Distance' },
      { name: 'Order & Ranking' },
      { name: 'Alphanumeric Series' },
      { name: 'Number Series' },
      { name: 'Letter Series' },
      { name: 'Input-Output' },
      { name: 'Data Sufficiency' },
      { name: 'Logical Reasoning' },
      { name: 'Statement & Conclusion' },
      { name: 'Statement & Assumption' },
      { name: 'Cause & Effect' },
      { name: 'Analogy' },
      { name: 'Classification' },
    ],
  },
  {
    id: 'english',
    name: 'English Language',
    shortName: 'English Language',
    matchKeywords: ['english', 'verbal', 'comprehension'],
    topics: [
      { name: 'Reading Comprehension' },
      { name: 'Cloze Test' },
      { name: 'Error Detection' },
      { name: 'Sentence Correction' },
      { name: 'Fill in the Blanks' },
      { name: 'Para Jumbles' },
      { name: 'Sentence Rearrangement' },
      { name: 'Phrase Replacement' },
      { name: 'Vocabulary' },
      { name: 'Synonyms & Antonyms' },
      { name: 'Idioms & Phrases' },
      { name: 'Word Usage' },
      {
        name: 'Grammar',
        subtopics: [
          'Tenses',
          'Articles',
          'Prepositions',
          'Subject-Verb Agreement',
          'Active & Passive Voice',
          'Direct & Indirect Speech',
          'Conjunctions',
          'Modifiers',
        ],
      },
    ],
  },
  {
    id: 'general_awareness',
    name: 'General Awareness / Current Affairs',
    shortName: 'General Awareness',
    matchKeywords: ['general awareness', 'current affairs', 'general knowledge', 'gk', 'current', 'news'],
    topics: [
      { name: 'Current Affairs' },
      { name: 'Banking Current Affairs' },
      { name: 'RBI Updates' },
      { name: 'Monetary Policy' },
      { name: 'Banking Terms' },
      { name: 'Financial Institutions' },
      { name: 'Government Schemes' },
      { name: 'Union Budget' },
      { name: 'Economic Survey' },
      { name: 'National News' },
      { name: 'International News' },
      { name: 'Awards & Honours' },
      { name: 'Sports' },
      { name: 'Important Appointments' },
      { name: 'Books & Authors' },
      { name: 'Important Days' },
      { name: 'Countries & Capitals' },
      { name: 'Static GK' },
    ],
  },
  {
    id: 'banking_awareness',
    name: 'Banking & Financial Awareness',
    shortName: 'Banking Awareness',
    matchKeywords: ['banking awareness', 'financial awareness', 'banking & finance', 'finance', 'economic issues', 'economy', 'financial management'],
    topics: [
      { name: 'History of Banking in India' },
      { name: 'Types of Banks' },
      { name: 'Types of Bank Accounts' },
      { name: 'Reserve Bank of India' },
      { name: 'SEBI' },
      { name: 'NABARD' },
      { name: 'SIDBI' },
      { name: 'EXIM Bank' },
      { name: 'NHB' },
      { name: 'IRDAI' },
      { name: 'PFRDA' },
      { name: 'Monetary Policy' },
      { name: 'Repo Rate' },
      { name: 'Reverse Repo Rate' },
      { name: 'CRR' },
      { name: 'SLR' },
      { name: 'Bank Rate' },
      { name: 'MSF' },
      { name: 'NPA' },
      { name: 'Basel Norms' },
      { name: 'Financial Inclusion' },
      { name: 'Digital Banking' },
      { name: 'UPI' },
      { name: 'NEFT' },
      { name: 'RTGS' },
      { name: 'IMPS' },
      { name: 'NPCI' },
      { name: 'Cheques' },
      { name: 'Negotiable Instruments' },
      { name: 'Loans & Advances' },
      { name: 'Priority Sector Lending' },
      { name: 'KYC' },
      { name: 'AML' },
      { name: 'Digital Payments' },
    ],
  },
  {
    id: 'computer',
    name: 'Computer Awareness',
    shortName: 'Computer Awareness',
    matchKeywords: ['computer', 'it', 'cyber', 'information technology'],
    topics: [
      { name: 'Computer Fundamentals' },
      { name: 'Hardware & Software' },
      { name: 'Operating Systems' },
      { name: 'MS Office' },
      { name: 'Internet' },
      { name: 'Computer Networking' },
      { name: 'Cyber Security' },
      { name: 'Computer Abbreviations' },
      { name: 'DBMS Basics' },
      { name: 'Programming Basics' },
      { name: 'Computer Memory' },
      { name: 'Input & Output Devices' },
      { name: 'Cloud Computing' },
      { name: 'Artificial Intelligence' },
      { name: 'Digital Banking Security' },
    ],
  },
];

/**
 * Maps an exam section name (e.g. "Numerical Ability", "Reasoning & Computer Aptitude")
 * to the closest matching syllabus subject.
 */
export function mapSectionNameToSubject(sectionName = '') {
  if (!sectionName) return BANKING_SYLLABUS[0];
  const normalized = sectionName.trim().toLowerCase();

  // Direct keyword matching
  for (const subject of BANKING_SYLLABUS) {
    if (subject.name.toLowerCase() === normalized) return subject;
    if (subject.shortName.toLowerCase() === normalized) return subject;
    for (const kw of subject.matchKeywords) {
      if (normalized.includes(kw)) {
        return subject;
      }
    }
  }

  // Fallback to first subject (Quant) if no match found
  return BANKING_SYLLABUS[0];
}

/**
 * Returns the list of standard topics for a section.
 */
export function getTopicsForSection(sectionName = '') {
  const subject = mapSectionNameToSubject(sectionName);
  return subject ? subject.topics : [];
}

/**
 * Returns the subtopics list for a specific topic name, if any exist.
 */
export function getSubtopicsForTopic(sectionName = '', topicName = '') {
  if (!topicName) return [];
  const topics = getTopicsForSection(sectionName);
  const found = topics.find((t) => t.name.toLowerCase() === topicName.trim().toLowerCase());
  return found?.subtopics || [];
}
