const mongoose = require('mongoose');
const Show = require('./models/Show');

const MONGO_URI = 'mongodb://localhost:27017/Streaming_Platform';

const sampleShows = [
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster_url: 'https://image.tmdb.org/t/p/w500/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg',
    trailer_url: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    director: 'Christopher Nolan',
    rating: 8.6,
    keywords: ['space', 'wormhole', 'time dilation']
  },
  {
    title: 'The Dark Knight',
    description: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.',
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    trailer_url: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    genres: ['Action', 'Crime', 'Drama'],
    actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    director: 'Christopher Nolan',
    rating: 9.0,
    keywords: ['joker', 'batman', 'gotham']
  },
  {
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother, a police chief, and his friends confront terrifying forces to get him back.',
    poster_url: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    trailer_url: 'https://www.youtube.com/embed/b9EkMc79ZSU',
    genres: ['Horror', 'Sci-Fi', 'Mystery'],
    actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
    director: 'The Duffer Brothers',
    rating: 8.7,
    keywords: ['upside down', '80s', 'kids']
  },
  {
    title: 'Dune',
    description: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the galaxy\'s most valuable asset.',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    trailer_url: 'https://www.youtube.com/embed/8g18jFHCLXk',
    genres: ['Sci-Fi', 'Adventure'],
    actors: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac'],
    director: 'Denis Villeneuve',
    rating: 8.1,
    keywords: ['desert', 'arrakis', 'spice']
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    await Show.deleteMany({});
    console.log('🧹 Cleared existing shows');

    await Show.insertMany(sampleShows);
    console.log(`🌱 Seeded ${sampleShows.length} shows`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

seedDB();



