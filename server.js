const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  isNonNullType,
} = require('graphql')

const skills = [
  { id: 1, skill: 'Javascript' },
  { id: 2, skill: 'C++' },
  { id: 3, skill: 'Python' },
]

const people = [
  {
    id: 1,
    firstName: 'Mateusz',
    lastName: 'Szczykutowicz',
    age: 22,
    skillId: 3,
  },
  { id: 2, firstName: 'Mateusz', lastName: 'Piwowarski', age: 23, skillId: 1 },
  { id: 3, firstName: 'Jakub', lastName: 'Piskorz', age: 25, skillId: 1 },
  { id: 4, firstName: 'Donald', lastName: 'Trump', age: 74, skillId: 2 },
  { id: 5, firstName: 'Alicja', lastName: 'Ćwiąkała', age: 5, skillId: 3 },
]

const SkillList = new GraphQLObjectType({
  name: 'skills',
  description: 'list of skills',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    skill: {
      type: GraphQLNonNull(GraphQLString),
    },
    experts: {
      type: new GraphQLList(PeopleList),
      resolve: (skill) => {
        return people.filter((person) => person.skillId == skill.id)
      },
    },
  }),
})

const PeopleList = new GraphQLObjectType({
  name: 'people',
  description: 'full list of people',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    firstName: {
      type: GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: GraphQLNonNull(GraphQLString),
    },
    age: {
      type: GraphQLNonNull(GraphQLInt),
    },
    skillId: {
      type: GraphQLNonNull(GraphQLInt),
    },
    stack: {
      type: SkillList,
      resolve: (person) => {
        return skills.find((skill) => skill.id === person.skillId)
      },
    },
  }),
})

const RootQuery = new GraphQLObjectType({
  name: 'rootQuery',
  description: 'root query',
  fields: () => ({
    people: {
      type: new GraphQLList(PeopleList),
      resolve: () => people,
    },
    skills: {
      type: new GraphQLList(SkillList),
      resolve: () => skills,
    },
    person: {
      type: PeopleList,
      description: 'A single person',
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) => people.find((person) => person.id === args.id),
    },
    skill: {
      type: SkillList,
      description: 'A single skill',
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) => skills.find((skill) => skill.id === args.id),
    },
  }),
})

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Mutation root',
  fields: () => ({
    addPerson: {
      type: PeopleList,
      description: 'Add a person',
      args: {
        firstName: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        skillId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const newPerson = {
          id: people.length + 1,
          firstName: args.firstName,
          lastName: args.lastName,
          skillId: args.skillId,
          age: args.age,
        }
        people.push(newPerson)
        return newPerson
      },
    },
    addSkill: {
      type: SkillList,
      description: 'Add a skill',
      args: {
        skill: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newSkill = {
          skill: args.skill,
          id: skills.length + 1,
        }
        skills.push(newSkill)
        return newSkill
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
})

const app = express()
app.listen(5000, () => console.log('Server port 5000'))
app.use(
  '/graphiql',
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
)
