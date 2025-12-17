import { db } from '../config/database.js';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies'];

// Curriculum Data for Grades 1-8
const CURRICULUM = {
    1: {
        Mathematics: ['Counting 1-100', 'Number Names', 'Addition (1-digit)', 'Subtraction (1-digit)', 'Shapes and Patterns'],
        Science: ['Living and Non-living Things', 'Plants Around Us', 'Animals Around Us', 'My Body', 'Food and Shelter'],
        English: ['The Alphabet', 'Vowels and Consonants', 'Naming Words (Nouns)', 'One and Many', 'This and That'],
        'Social Studies': ['About Me', 'My Family', 'My School', 'Good Habits', 'Our Festivals']
    },
    2: {
        Mathematics: ['Numbers up to 1000', 'Addition (2-digit)', 'Subtraction (2-digit)', 'Introduction to Multiplication', 'Time and Calendar'],
        Science: ['Types of Plants', 'Wild and Domestic Animals', 'Air and Water', 'Our Universe', 'Safety Rules'],
        English: ['Action Words (Verbs)', 'Describing Words (Adjectives)', 'Pronouns', 'Prepositions', 'Reading Comprehension'],
        'Social Studies': ['Types of Houses', 'Clothes We Wear', 'Our Neighborhood', 'Places of Worship', 'Transport']
    },
    3: {
        Mathematics: ['4-Digit Numbers', 'Addition and Subtraction', 'Multiplication Tables', 'Division Basics', 'Money'],
        Science: ['Eating Habits of Animals', 'Birds and Insects', 'Parts of a Plant', 'States of Matter', 'Soil'],
        English: ['Articles (A, An, The)', 'Conjunctions', 'Tenses (Simple Present)', 'Antonyms and Synonyms', 'Paragraph Writing'],
        'Social Studies': ['The Earth and Sky', 'Continents and Oceans', 'Our Country', 'National Symbols', 'Early Humans']
    },
    4: {
        Mathematics: ['Large Numbers', 'Multiplication and Division', 'Factors and Multiples', 'Fractions', 'Decimals'],
        Science: ['Adaptations in Plants', 'Adaptations in Animals', 'Human Digestive System', 'Force, Work, and Energy', 'Solar System'],
        English: ['Types of Nouns', 'Adverbs', 'Tenses (Continuous)', 'Punctuation', 'Letter Writing'],
        'Social Studies': ['Physical Features of Country', 'Climate and Seasons', 'Natural Resources', 'Soils of Country', 'Forests and Wildlife']
    },
    5: {
        Mathematics: ['Operations on Large Numbers', 'HCF and LCM', 'Fractions and Decimals', 'Area and Perimeter', 'Volume'],
        Science: ['Reproduction in Plants', 'Animals and their Lifestyles', 'Human Skeletal System', 'Nervous System', 'Moon and Eclipses'],
        English: ['Types of Pronouns', 'Prepositions of Place/Time', 'Tenses (Perfect)', 'Direct and Indirect Speech', 'Story Writing'],
        'Social Studies': ['Globes and Maps', 'Latitudes and Longitudes', 'Movements of Earth', 'Environmental Pollution', 'United Nations']
    },
    6: {
        Mathematics: ['Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas', 'Integers'],
        Science: ['Food: Where Does it Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials', 'Separation of Substances'],
        English: ['Sentences and Phrases', 'Nouns: Gender and Case', 'Adjectives: Degrees', 'Verbs: Transitive/Intransitive', 'Notice Writing'],
        'Social Studies': ['The Earth in the Solar System', 'Globe: Latitudes and Longitudes', 'Motions of the Earth', 'Maps', 'Major Domains of the Earth']
    },
    7: {
        Mathematics: ['Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations', 'Lines and Angles'],
        Science: ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases and Salts'],
        English: ['The Sentence', 'Nouns', 'Pronouns', 'Adjectives', 'Verbs'],
        'Social Studies': ['Environment', 'Inside Our Earth', 'Our Changing Earth', 'Air', 'Water']
    },
    8: {
        Mathematics: ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Practical Geometry', 'Data Handling'],
        Science: ['Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics', 'Materials: Metals and Non-Metals', 'Coal and Petroleum'],
        English: ['Tenses', 'Voice', 'Speech', 'Determiners', 'Composition'],
        'Social Studies': ['Resources', 'Land, Soil, Water, Natural Vegetation', 'Mineral and Power Resources', 'Agriculture', 'Industries']
    }
};

function generateQuestions(topicId, topicName, grade) {
    const questions = [];
    const questionTemplates = [
        {
            q: `What is the basic concept of ${topicName}?`,
            options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
            ans: 'Concept A'
        },
        {
            q: `Which of the following relates to ${topicName}?`,
            options: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
            ans: 'Item 1'
        },
        {
            q: `Solve a problem related to ${topicName}.`,
            options: ['Solution X', 'Solution Y', 'Solution Z', 'Solution W'],
            ans: 'Solution X'
        },
        {
            q: `Identify the correct statement about ${topicName}.`,
            options: ['Statement True', 'Statement False 1', 'Statement False 2', 'Statement False 3'],
            ans: 'Statement True'
        },
        {
            q: `Why is ${topicName} important?`,
            options: ['Reason 1', 'Reason 2', 'Reason 3', 'Reason 4'],
            ans: 'Reason 1'
        }
    ];

    for (let i = 0; i < 5; i++) {
        const template = questionTemplates[i];
        questions.push({
            topic_id: topicId,
            content: template.q,
            type: 'MCQ',
            options: JSON.stringify(template.options),
            correct_answer: template.ans,
            explanation: `This is the correct answer because it directly relates to the core principles of ${topicName}.`,
            difficulty_level: 3,
            estimated_time: 60,
            source: 'seed'
        });
    }
    return questions;
}

function seedCurriculum() {
    console.log('🌱 Seeding Curriculum Data...');
    console.log('📂 Database File:', db.name);

    let insertTopic, insertQuestion;
    try {
        insertTopic = db.prepare(`
            INSERT INTO topics (name, subject, grade, difficulty, source, status, content)
            VALUES (?, ?, ?, ?, 'seed', 'published', ?)
        `);

        insertQuestion = db.prepare(`
            INSERT INTO questions (topic_id, content, type, options, correct_answer, explanation, difficulty_level, estimated_time, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seed')
        `);
    } catch (err) {
        console.error('❌ Error preparing statements:', err.message);
        return;
    }

    // Optional: Clear existing seed data to avoid duplicates
    // db.prepare("DELETE FROM questions WHERE source = 'seed'").run();
    // db.prepare("DELETE FROM topics WHERE source = 'seed'").run();
    // console.log('🧹 Cleared existing seed data.');

    let topicCount = 0;
    let questionCount = 0;

    for (let grade = 1; grade <= 8; grade++) {
        console.log(`Processing Grade ${grade}...`);
        const gradeData = CURRICULUM[grade];
        if (!gradeData) {
            console.log(`No data for Grade ${grade}`);
            continue;
        }

        for (const subject of SUBJECTS) {
            const topics = gradeData[subject];
            if (!topics) continue;

            for (const topicName of topics) {
                try {
                    // Check if topic exists to avoid duplicates if we didn't clear
                    const existing = db.prepare('SELECT id FROM topics WHERE name = ? AND grade = ? AND subject = ?').get(topicName, grade, subject);

                    let topicId;
                    if (existing) {
                        topicId = existing.id;
                    } else {
                        const content = JSON.stringify({
                            theory: `Introduction to ${topicName}. This topic covers the fundamental concepts and applications of ${topicName} in ${subject}.`,
                            description: `Learn about ${topicName}`
                        });
                        const result = insertTopic.run(topicName, subject, grade, 3, content);
                        topicId = result.lastInsertRowid;
                        topicCount++;
                    }

                    // Check if questions exist for this topic
                    const qCount = db.prepare('SELECT COUNT(*) as count FROM questions WHERE topic_id = ?').get(topicId).count;

                    if (qCount === 0) {
                        const questions = generateQuestions(topicId, topicName, grade);
                        for (const q of questions) {
                            insertQuestion.run(
                                q.topic_id,
                                q.content,
                                q.type,
                                q.options,
                                q.correct_answer,
                                q.explanation,
                                q.difficulty_level,
                                q.estimated_time
                            );
                            questionCount++;
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error inserting topic "${topicName}" (Grade ${grade}, ${subject}):`, err.message);
                }
            }
        }
    }

    console.log(`✅ Seeding Complete!`);
    console.log(`   - Topics Added: ${topicCount}`);
    console.log(`   - Questions Added: ${questionCount}`);
}

seedCurriculum();
