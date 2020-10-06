const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} = require('graphql')

const games = [
  {
    title: 'League of Legends',
    publisher: 'Riot Games',
    release: 2009,
    genreId: 1,
  },
  { title: 'Minecraft', publisher: 'Mojang', release: 2011, genreId: 2 },
  {
    title: 'Grand Theft Auto V',
    publisher: 'Rockstar Games',
    release: 2013,
    genreId: 2,
  },
  { title: 'Smite', publisher: 'Hi-Rez', release: 2014, genreId: 1 },
  {
    title: 'Double Dealing Character',
    publisher: 'ZUN',
    release: 2013,
    genreId: 3,
  },
  {
    title: 'Legacy of Lunatic Kingdom',
    publisher: 'ZUN',
    release: 2015,
    genreId: 3,
  },
]
const genres = [
  { id: 1, name: 'MOBA' },
  { id: 2, name: 'Sandbox' },
  { id: 3, name: 'Danmaku' },
]

const GameType = new GraphQLObjectType({
  name: 'game',
  fields: () => ({
    title: {
      type: GraphQLNonNull(GraphQLString),
    },
    publisher: {
      type: GraphQLNonNull(GraphQLString),
    },
    release: {
      type: GraphQLNonNull(GraphQLInt),
    },
    genreId: {
      type: GraphQLNonNull(GraphQLInt),
    },
    genre: {
      type: GenreType,
      resolve: (parent) => genres.find((genre) => genre.id === parent.genreId),
    },
  }),
})
const GenreType = new GraphQLObjectType({
  name: 'genre',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    games: {
      type: new GraphQLList(GameType),
      resolve: (parent) => games.filter((game) => game.genreId === parent.id),
    },
  }),
})

const RootQueryType = new GraphQLObjectType({
  name: 'root',
  fields: () => ({
    games: {
      type: new GraphQLList(GameType),
      resolve: () => games,
    },
    genres: {
      type: new GraphQLList(GenreType),
      resolve: () => genres,
    },
  }),
})

const MutationType = new GraphQLObjectType({
  name: 'mutation',
  fields: () => ({
    addGame: {
      type: GameType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        publisher: { type: GraphQLNonNull(GraphQLString) },
        release: { type: GraphQLNonNull(GraphQLInt) },
        genreId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const newGame = {
          title: args.title,
          publisher: args.publisher,
          release: args.release,
          genreId: args.genreId,
        }
        games.push(newGame)
        return newGame
      },
    },
    addGenre: {
      type: GenreType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newGenre = {
          name: args.name,
          id: genres.length + 1,
        }
        genres.push(newGenre)
        return newGenre
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType,
})

const app = express()
app.listen(5000, () => console.log('server: 5000'))
app.use(
  '/graphiql',
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
)
