import { db, initializeDatabase } from './database.js';

// Ensure database is initialized
initializeDatabase();


// Sample topics with AI-generated content for Classes 1-8
const topics = [
    // Class 1 - Math
    {
        name: 'Numbers 1-10',
        subject: 'Math',
        grade: 1,
        difficulty: 1,
        prerequisites: '[]',
        content: JSON.stringify({
            theory: 'Numbers are symbols we use to count things. We start with 1, 2, 3, and go up to 10.',
            examples: ['1 apple, 2 apples, 3 apples', 'Count your fingers: 1, 2, 3, 4, 5'],
            keyPoints: ['Numbers help us count', 'We can write numbers as digits (1, 2, 3)', 'We can say numbers as words (one, two, three)'],
            simplified_explanation: 'Imagine you have toys. If you have one toy, that\'s the number 1. If you have two toys, that\'s the number 2!',
            realLifeExamples: ['Counting candies in your hand', 'Counting steps while walking', 'Counting birds in the sky'],
            storyModeExplanation: 'Once upon a time, there was a little rabbit who loved to count carrots. One day, he found 1 carrot, then 2 carrots, then 3 carrots! He was so happy counting all his carrots from 1 to 10.'
        })
    },
    {
        name: 'Addition Basics',
        subject: 'Math',
        grade: 1,
        difficulty: 2,
        prerequisites: JSON.stringify(['Numbers 1-10']),
        content: JSON.stringify({
            theory: 'Addition means putting things together. When we add, we get more!',
            examples: ['2 + 3 = 5 (two apples plus three apples equals five apples)', '1 + 1 = 2'],
            keyPoints: ['The + sign means add', 'Adding makes numbers bigger', 'We can add by counting'],
            simplified_explanation: 'If you have 2 cookies and your friend gives you 3 more cookies, now you have 5 cookies total!',
            realLifeExamples: ['Adding toys to your collection', 'Combining two groups of friends', 'Putting more water in a glass'],
            storyModeExplanation: 'Little Timmy had 2 toy cars. On his birthday, he got 3 more toy cars as gifts. Now Timmy has 2 + 3 = 5 toy cars to play with!'
        })
    },

    // Class 2 - Math
    {
        name: 'Multiplication Tables (2, 3, 4)',
        subject: 'Math',
        grade: 2,
        difficulty: 3,
        prerequisites: JSON.stringify(['Addition Basics']),
        content: JSON.stringify({
            theory: 'Multiplication is repeated addition. Instead of adding the same number many times, we multiply!',
            examples: ['2 × 3 = 6 (same as 2 + 2 + 2)', '3 × 4 = 12 (same as 3 + 3 + 3 + 3)'],
            keyPoints: ['× means multiply', 'Multiplication is faster than repeated addition', 'Learn tables by heart'],
            simplified_explanation: 'If you have 3 bags and each bag has 4 candies, instead of counting 4+4+4, you can multiply: 3×4=12 candies!',
            realLifeExamples: ['Counting wheels on cars (4 wheels × 3 cars)', 'Buying multiple items at the same price', 'Arranging chairs in rows'],
            storyModeExplanation: 'In a magical garden, there were 3 flower beds. Each bed had 4 beautiful flowers. The gardener used multiplication magic: 3 × 4 = 12 flowers in total!'
        })
    },

    // Class 3 - Math
    {
        name: 'Fractions - Half and Quarter',
        subject: 'Math',
        grade: 3,
        difficulty: 3,
        prerequisites: '[]',
        content: JSON.stringify({
            theory: 'A fraction is a part of a whole. Half means 1 out of 2 equal parts. Quarter means 1 out of 4 equal parts.',
            examples: ['1/2 of a pizza', '1/4 of a chocolate bar', '3/4 of an hour = 45 minutes'],
            keyPoints: ['Numerator (top) = parts we have', 'Denominator (bottom) = total equal parts', '1/2 = 0.5', '1/4 = 0.25'],
            simplified_explanation: 'Imagine cutting a pizza into 2 equal slices. If you take 1 slice, you have half (1/2) of the pizza!',
            realLifeExamples: ['Sharing a sandwich with a friend', 'Drinking half a glass of juice', 'Eating a quarter of a cake'],
            storyModeExplanation: 'Four friends found a treasure chest with gold coins. They divided it into 4 equal parts. Each friend got 1/4 (one quarter) of the treasure!'
        })
    },

    // Class 4 - Math
    {
        name: 'Area and Perimeter',
        subject: 'Math',
        grade: 4,
        difficulty: 4,
        prerequisites: JSON.stringify(['Multiplication Tables (2, 3, 4)']),
        content: JSON.stringify({
            theory: 'Perimeter is the distance around a shape. Area is the space inside a shape.',
            examples: ['Rectangle: Perimeter = 2(length + width), Area = length × width', 'Square: Perimeter = 4 × side, Area = side × side'],
            keyPoints: ['Perimeter is measured in units (cm, m)', 'Area is measured in square units (cm², m²)', 'Different formulas for different shapes'],
            simplified_explanation: 'Perimeter is like walking around your garden. Area is like how much grass you need to cover your garden!',
            realLifeExamples: ['Fencing around a playground (perimeter)', 'Carpet needed for a room (area)', 'Paint needed for a wall (area)'],
            storyModeExplanation: 'A farmer wanted to build a fence around his rectangular farm (perimeter) and also needed to know how much land he could plant crops on (area)!'
        })
    },

    // Class 5 - Science
    {
        name: 'States of Matter',
        subject: 'Science',
        grade: 5,
        difficulty: 3,
        prerequisites: '[]',
        content: JSON.stringify({
            theory: 'Matter exists in three main states: Solid, Liquid, and Gas. Each has different properties.',
            examples: ['Solid: ice, rock, wood', 'Liquid: water, milk, juice', 'Gas: air, steam, oxygen'],
            keyPoints: ['Solids have fixed shape and volume', 'Liquids have fixed volume but take shape of container', 'Gases have no fixed shape or volume'],
            simplified_explanation: 'Think of ice (solid), water (liquid), and steam (gas) - they\'re all the same thing (H₂O) but in different states!',
            realLifeExamples: ['Ice melting into water', 'Water boiling into steam', 'Breathing air (gas)'],
            storyModeExplanation: 'Meet Molly the water molecule! In winter, she\'s solid ice. In spring, she melts into liquid water. In summer, she evaporates into gas and floats in the sky as steam!'
        })
    },

    // Class 6 - Science
    {
        name: 'Photosynthesis',
        subject: 'Science',
        grade: 6,
        difficulty: 4,
        prerequisites: JSON.stringify(['States of Matter']),
        content: JSON.stringify({
            theory: 'Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide.',
            examples: ['Green leaves absorb sunlight', 'Roots absorb water from soil', 'Leaves take in CO₂ from air'],
            keyPoints: ['Equation: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂', 'Chlorophyll makes leaves green', 'Plants release oxygen', 'Happens in chloroplasts'],
            simplified_explanation: 'Plants are like tiny factories! They use sunlight as energy, water and air as ingredients, and make sugar (food) and oxygen!',
            realLifeExamples: ['Trees producing oxygen we breathe', 'Plants growing towards sunlight', 'Green leaves vs yellow leaves (less chlorophyll)'],
            storyModeExplanation: 'In a magical forest, trees had tiny green workers called chlorophyll. Every morning, they caught sunlight, mixed it with water and air, and created delicious sugar food while releasing fresh oxygen for all animals!'
        })
    },

    // Class 7 - Math
    {
        name: 'Algebraic Expressions',
        subject: 'Math',
        grade: 7,
        difficulty: 4,
        prerequisites: '[]',
        content: JSON.stringify({
            theory: 'Algebra uses letters (variables) to represent unknown numbers. An expression combines numbers and variables using operations.',
            examples: ['3x + 5', '2a - 7b', 'x² + 2x + 1'],
            keyPoints: ['Variables represent unknown values', 'Coefficients are numbers before variables', 'Like terms can be combined', 'Follow order of operations (PEMDAS)'],
            simplified_explanation: 'Think of x as a mystery box. If the expression is 3x + 5, it means "3 times whatever is in the box, plus 5"!',
            realLifeExamples: ['Calculating total cost: price × quantity + tax', 'Distance = speed × time', 'Age problems (my age + 5 years)'],
            storyModeExplanation: 'Detective Alex was solving a mystery. The clue said "3x + 5 = 20". Alex thought: what number times 3, plus 5, equals 20? After thinking, Alex found x = 5!'
        })
    },

    // Class 8 - Science
    {
        name: 'Laws of Motion',
        subject: 'Science',
        grade: 8,
        difficulty: 5,
        prerequisites: '[]',
        content: JSON.stringify({
            theory: 'Newton\'s Three Laws of Motion explain how objects move. 1st: Objects stay at rest or in motion unless acted upon. 2nd: F=ma. 3rd: Every action has equal and opposite reaction.',
            examples: ['1st Law: Ball keeps rolling until friction stops it', '2nd Law: Pushing harder makes object accelerate more', '3rd Law: Rocket pushes gas down, gas pushes rocket up'],
            keyPoints: ['Inertia = resistance to change in motion', 'Force = mass × acceleration', 'Action-reaction pairs', 'Friction opposes motion'],
            simplified_explanation: 'Imagine pushing a shopping cart. Empty cart (less mass) is easy to push. Full cart (more mass) needs more force. That\'s F=ma!',
            realLifeExamples: ['Seatbelts in cars (1st law)', 'Kicking a football (2nd law)', 'Swimming (pushing water back, water pushes you forward - 3rd law)'],
            storyModeExplanation: 'Young scientist Newton sat under an apple tree. An apple fell on his head! He wondered: why did it fall? Why didn\'t it float? This led him to discover the laws that govern all motion in the universe!'
        })
    }
];

// Sample questions for each topic
const questions = [
    // Numbers 1-10
    { topic_name: 'Numbers 1-10', content: 'How many fingers do you have on one hand?', type: 'MCQ', options: JSON.stringify(['3', '5', '7', '10']), correct_answer: '5', explanation: 'Count your fingers on one hand: 1, 2, 3, 4, 5!', difficulty_level: 1, estimated_time: 30 },
    { topic_name: 'Numbers 1-10', content: 'What comes after 7?', type: 'FILL_BLANK', options: null, correct_answer: '8', explanation: 'The number sequence is: 7, 8, 9, 10', difficulty_level: 1, estimated_time: 20 },

    // Addition Basics
    { topic_name: 'Addition Basics', content: 'What is 2 + 3?', type: 'MCQ', options: JSON.stringify(['4', '5', '6', '7']), correct_answer: '5', explanation: 'When you add 2 and 3, you get 5. Try counting: 1, 2 (that\'s 2), then 3, 4, 5 (that\'s 3 more)', difficulty_level: 2, estimated_time: 40 },
    { topic_name: 'Addition Basics', content: 'If you have 1 apple and get 4 more apples, how many apples do you have?', type: 'FILL_BLANK', options: null, correct_answer: '5', explanation: '1 + 4 = 5 apples', difficulty_level: 2, estimated_time: 45 },

    // Multiplication Tables
    { topic_name: 'Multiplication Tables (2, 3, 4)', content: 'What is 3 × 4?', type: 'MCQ', options: JSON.stringify(['7', '10', '12', '15']), correct_answer: '12', explanation: '3 × 4 = 12. Think of it as 3 + 3 + 3 + 3 = 12', difficulty_level: 3, estimated_time: 50 },
    { topic_name: 'Multiplication Tables (2, 3, 4)', content: '2 × 5 = __', type: 'FILL_BLANK', options: null, correct_answer: '10', explanation: '2 × 5 = 10. You can count: 2, 4, 6, 8, 10', difficulty_level: 3, estimated_time: 40 },

    // Fractions
    { topic_name: 'Fractions - Half and Quarter', content: 'What is half of 8?', type: 'MCQ', options: JSON.stringify(['2', '4', '6', '8']), correct_answer: '4', explanation: 'Half means divide by 2. 8 ÷ 2 = 4', difficulty_level: 3, estimated_time: 60 },
    { topic_name: 'Fractions - Half and Quarter', content: 'If you eat 1/4 of a pizza with 8 slices, how many slices did you eat?', type: 'FILL_BLANK', options: null, correct_answer: '2', explanation: '1/4 of 8 = 8 ÷ 4 = 2 slices', difficulty_level: 3, estimated_time: 70 },

    // Area and Perimeter
    { topic_name: 'Area and Perimeter', content: 'What is the perimeter of a square with side 5 cm?', type: 'MCQ', options: JSON.stringify(['10 cm', '15 cm', '20 cm', '25 cm']), correct_answer: '20 cm', explanation: 'Perimeter of square = 4 × side = 4 × 5 = 20 cm', difficulty_level: 4, estimated_time: 80 },
    { topic_name: 'Area and Perimeter', content: 'Find the area of a rectangle with length 6 cm and width 3 cm.', type: 'FILL_BLANK', options: null, correct_answer: '18', explanation: 'Area = length × width = 6 × 3 = 18 cm²', difficulty_level: 4, estimated_time: 90 },

    // States of Matter
    { topic_name: 'States of Matter', content: 'Which state of matter has a fixed shape and volume?', type: 'MCQ', options: JSON.stringify(['Solid', 'Liquid', 'Gas', 'Plasma']), correct_answer: 'Solid', explanation: 'Solids have both fixed shape and fixed volume. Liquids have fixed volume but no fixed shape. Gases have neither.', difficulty_level: 3, estimated_time: 60 },
    { topic_name: 'States of Matter', content: 'When water boils, it changes from liquid to __.', type: 'FILL_BLANK', options: null, correct_answer: 'gas', explanation: 'Boiling water turns into steam, which is water in gas state', difficulty_level: 3, estimated_time: 50 },

    // Photosynthesis
    { topic_name: 'Photosynthesis', content: 'What gas do plants release during photosynthesis?', type: 'MCQ', options: JSON.stringify(['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen']), correct_answer: 'Oxygen', explanation: 'Plants take in CO₂ and release O₂ (oxygen) during photosynthesis', difficulty_level: 4, estimated_time: 70 },
    { topic_name: 'Photosynthesis', content: 'The green pigment in plants that absorbs sunlight is called __.', type: 'FILL_BLANK', options: null, correct_answer: 'chlorophyll', explanation: 'Chlorophyll is the green pigment that captures light energy for photosynthesis', difficulty_level: 4, estimated_time: 60 },

    // Algebraic Expressions
    { topic_name: 'Algebraic Expressions', content: 'If x = 3, what is 2x + 5?', type: 'MCQ', options: JSON.stringify(['8', '10', '11', '13']), correct_answer: '11', explanation: '2x + 5 = 2(3) + 5 = 6 + 5 = 11', difficulty_level: 4, estimated_time: 90 },
    { topic_name: 'Algebraic Expressions', content: 'Simplify: 3a + 2a = __', type: 'FILL_BLANK', options: null, correct_answer: '5a', explanation: 'Combine like terms: 3a + 2a = 5a', difficulty_level: 4, estimated_time: 70 },

    // Laws of Motion
    { topic_name: 'Laws of Motion', content: 'According to Newton\'s 2nd Law, Force equals:', type: 'MCQ', options: JSON.stringify(['mass × velocity', 'mass × acceleration', 'mass ÷ acceleration', 'velocity × time']), correct_answer: 'mass × acceleration', explanation: 'Newton\'s 2nd Law: F = ma (Force = mass × acceleration)', difficulty_level: 5, estimated_time: 100 },
    { topic_name: 'Laws of Motion', content: 'Newton\'s 3rd Law states: For every action, there is an equal and opposite __.', type: 'FILL_BLANK', options: null, correct_answer: 'reaction', explanation: 'Newton\'s 3rd Law: Every action has an equal and opposite reaction', difficulty_level: 5, estimated_time: 80 }
];

// Insert topics
const insertTopic = db.prepare(
    'INSERT INTO topics (name, subject, grade, difficulty, prerequisites, theory, eli5, story, examples, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const topicIds = {};
for (const topic of topics) {
    const content = JSON.parse(topic.content);
    const result = insertTopic.run(
        topic.name,
        topic.subject,
        topic.grade,
        topic.difficulty,
        topic.prerequisites,
        content.theory,
        content.simplified_explanation,
        content.storyModeExplanation,
        content.realLifeExamples.join('. '),
        'seed',
        'published'
    );
    topicIds[topic.name] = result.lastInsertRowid;
    console.log(`✅ Added topic: ${topic.name} (Grade ${topic.grade})`);
}

// Insert questions
const insertQuestion = db.prepare(
    'INSERT INTO questions (topic_id, content, type, options, correct_answer, explanation, difficulty_level, estimated_time, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

for (const question of questions) {
    const topicId = topicIds[question.topic_name];
    if (topicId) {
        insertQuestion.run(
            topicId,
            question.content,
            question.type,
            question.options,
            question.correct_answer,
            question.explanation,
            question.difficulty_level,
            question.estimated_time,
            'seed'
        );
        console.log(`  ➕ Added question for: ${question.topic_name}`);
    }
}

console.log('\n🎉 Database seeded successfully!');
console.log(`📚 Total topics: ${topics.length}`);
console.log(`❓ Total questions: ${questions.length}`);

db.close();
