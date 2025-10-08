const mongoose = require('mongoose');
const Show = require('./models/Show'); // Make sure this path is correct

// Ensure you have your MongoDB connection string here
const MONGO_URI = 'mongodb://127.0.0.1:27017/Streaming_Platform';

const sampleShows = [
  // --- Popular Category ---
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailer_url: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    director: 'Christopher Nolan',
    rating: 8.7,
    keywords: ['space', 'wormhole', 'time dilation'],
    category: 'popular'
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
    keywords: ['joker', 'batman', 'gotham'],
    category: 'popular'
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster_url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    trailer_url: 'https://www.youtube.com/embed/6hB3S9bIaco',
    genres: ['Drama', 'Crime'],
    actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    director: 'Frank Darabont',
    rating: 9.3,
    keywords: ['prison', 'friendship', 'hope'],
    category: 'popular'
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    trailer_url: 'https://www.youtube.com/embed/s7EdQ4FqbhY',
    genres: ['Crime', 'Thriller'],
    actors: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
    director: 'Quentin Tarantino',
    rating: 8.9,
    keywords: ['hitman', 'gangster', 'nonlinear'],
    category: 'popular'
  },
   {
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    poster_url: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    trailer_url: 'https://www.youtube.com/embed/V75dMMIW2B4',
    genres: ['Fantasy', 'Adventure', 'Action'],
    actors: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'],
    director: 'Peter Jackson',
    rating: 8.8,
    keywords: ['middle-earth', 'hobbit', 'one ring'],
    category: 'popular'
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    trailer_url: 'https://www.youtube.com/embed/sY1S34973zA',
    genres: ['Crime', 'Drama'],
    actors: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    director: 'Francis Ford Coppola',
    rating: 9.2,
    keywords: ['mafia', 'crime family', 'new york'],
    category: 'popular'
  },
  {
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    poster_url: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    trailer_url: 'https://www.youtube.com/embed/bLvqoHBptjg',
    genres: ['Comedy', 'Drama', 'Romance'],
    actors: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    director: 'Robert Zemeckis',
    rating: 8.8,
    keywords: ['history', 'vietnam', 'love story'],
    category: 'popular'
  },
  {
    title: 'Fight Club',
    description: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more.',
    poster_url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    trailer_url: 'https://www.youtube.com/embed/SUXWAEX2jlg',
    genres: ['Drama'],
    actors: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    director: 'David Fincher',
    rating: 8.8,
    keywords: ['anarchy', 'consumerism', 'split personality'],
    category: 'popular'
  },
  
  // --- You Might Like Category ---
  {
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.',
    poster_url: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    trailer_url: 'https://www.youtube.com/embed/b9EkMc79ZSU',
    genres: ['Horror', 'Sci-Fi', 'Mystery'],
    actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
    director: 'The Duffer Brothers',
    rating: 8.7,
    keywords: ['upside down', '80s', 'kids'],
    category: 'you-might-like'
  },
  {
    title: 'Dune',
    description: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    trailer_url: 'https://www.youtube.com/embed/8g18jFHCLXk',
    genres: ['Sci-Fi', 'Adventure'],
    actors: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac'],
    director: 'Denis Villeneuve',
    rating: 7.9,
    keywords: ['desert', 'arrakis', 'spice'],
    category: 'you-might-like'
  },
  {
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family\'s future.',
    poster_url: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    trailer_url: 'https://www.youtube.com/embed/HhesaQXLuRY',
    genres: ['Crime', 'Drama', 'Thriller'],
    actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    director: 'Vince Gilligan',
    rating: 9.5,
    keywords: ['drugs', 'cancer', 'transformation'],
    category: 'you-might-like'
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEt3znujQWroPSySNolAAROc.jpg',
    trailer_url: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    director: 'Christopher Nolan',
    rating: 8.8,
    keywords: ['dreams', 'subconscious', 'reality'],
    category: 'you-might-like'
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    trailer_url: 'https://www.youtube.com/embed/5xH0HfJHsaY',
    genres: ['Comedy', 'Thriller', 'Drama'],
    actors: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    director: 'Bong Joon Ho',
    rating: 8.5,
    keywords: ['class', 'inequality', 'dark comedy'],
    category: 'you-might-like'
  },
  {
    title: 'The Matrix',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    poster_url: 'https://image.tmdb.org/t/p/w500/f89JxwIhLENSzLJSFNUTvfVvKbB.jpg',
    trailer_url: 'https://www.youtube.com/embed/vKQi3bBA1y8',
    genres: ['Action', 'Sci-Fi'],
    actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    director: 'The Wachowskis',
    rating: 8.7,
    keywords: ['simulation', 'ai', 'dystopia'],
    category: 'you-might-like'
  },
  {
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    poster_url: 'https://image.tmdb.org/t/p/w500/39wmItIW2zwAtoO7K4a2u9w8oC4.jpg',
    trailer_url: 'https://www.youtube.com/embed/ByXuk9QqQkk',
    genres: ['Animation', 'Family', 'Fantasy'],
    actors: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    director: 'Hayao Miyazaki',
    rating: 8.6,
    keywords: ['anime', 'spirit world', 'studio ghibli'],
    category: 'you-might-like'
  },
  {
    title: 'Blade Runner 2049',
    description: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    trailer_url: 'https://www.youtube.com/embed/gCcx85zbxz4',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    actors: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
    director: 'Denis Villeneuve',
    rating: 7.8,
    keywords: ['cyberpunk', 'replicant', 'dystopia'],
    category: 'you-might-like'
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
    console.log(`🌱 Seeded ${sampleShows.length} new shows into the database`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

seedDB();

