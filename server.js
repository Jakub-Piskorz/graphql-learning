const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require('graphql')
require('graphql')

const cameras = [
  { id: 1, name: 'X-T3 Body Silver', color: 'silver', brandId: 1, price: 5899 },
  { id: 2, name: 'X-T3 Body Black', color: 'black', brandId: 1, price: 5899 },
  {
    id: 3,
    name: 'X-T3 Body Black + XF18-55',
    color: 'silver',
    brandId: 1,
    price: 7398,
    addonsId: [1],
  },
  { id: 4, name: 'EOS RP Body', color: 'black', brandId: 2, price: 5299 },
  {
    id: 5,
    name: 'EOS RP + 24-105 f/4 + adaptor',
    color: 'silver',
    brandId: 2,
    addonsId: [2, 3],
    price: 9099,
  },
  { id: 6, name: 'D610 Body', color: 'black', brandId: 3, price: 5699 },
]

const addons = [
  {
    id: 1,
    name: 'XF 18-55mm',
    brandId: 1,
    price: 800,
  },
  {
    id: 2,
    name: 'EOS EF -> RF ',
    brandId: 2,
    price: 499,
  },
  {
    id: 3,
    name: 'Fujinon 24-105 f/4',
    brandId: 1,
  },
]
const brands = [
  { id: 1, name: 'Fujifilm' },
  { id: 2, name: 'Canon' },
  { id: 3, name: 'Nikon' },
]

const CameraType = new GraphQLObjectType({
  name: 'camera',
  description: 'Here you will find information of your chosen camera.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    color: {
      type: GraphQLString,
    },
    brandId: {
      type: GraphQLInt,
    },
    price: {
      type: GraphQLInt,
    },
    addonsId: {
      type: GraphQLList(GraphQLInt),
    },
    addons: {
      type: new GraphQLList(AddonType),
      resolve: (parent) => {
        if (parent.addonsId)
          return addons.filter((addon) =>
            parent.addonsId.filter((cameraId) => cameraId === addon.id)
          )
      },
    },
    brand: {
      type: BrandType,
      resolve: (parent) => brands.find((brand) => brand.id === parent.brandId),
    },
  }),
})

const AddonType = new GraphQLObjectType({
  name: 'addon',
  description: 'All informations about camera addons.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    brandId: {
      type: GraphQLInt,
    },
    price: {
      type: GraphQLInt,
    },
    includedIn: {
      type: new GraphQLList(CameraType),
      resolve: (parent) => {
        return cameras.filter((camera) =>
          camera.addonsId
            ? camera.addonsId.find((addonId) => addonId === parent.id)
            : null
        )
      },
    },
  }),
})

const BrandType = new GraphQLObjectType({
  name: 'brand',
  description: 'List of all brands in our database.',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    ofCameras: {
      type: new GraphQLList(CameraType),
      resolve: (parent) =>
        cameras.filter((camera) => camera.brandId === parent.id),
    },
    ofAddons: {
      type: new GraphQLList(AddonType),
      resolve: (parent) =>
        addons.filter((addon) => addon.brandId === parent.id),
    },
  }),
})

const RootQueryType = new GraphQLObjectType({
  name: 'root',
  fields: () => ({
    cameras: {
      type: new GraphQLList(CameraType),
      resolve: () => cameras,
    },
    camera: {
      type: CameraType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) =>
        cameras.find((camera) => camera.id === args.id),
    },
    addons: {
      type: new GraphQLList(AddonType),
      resolve: () => addons,
    },
    addon: {
      type: AddonType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => addons.find((addon) => addon.id === args.id),
    },
    brands: {
      type: new GraphQLList(BrandType),
      resolve: () => brands,
    },
    brand: {
      type: BrandType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => brands.find((brand) => brand.id === args.id),
    },
  }),
})

const MutationType = new GraphQLObjectType({
  name: 'mutation',
  fields: () => ({
    addCamera: {
      type: CameraType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        color: { type: GraphQLString },
        price: { type: GraphQLInt },
        brandId: { type: GraphQLInt },
        addonsId: { type: GraphQLList(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const NewCamera = {
          id: cameras.length + 1,
          name: args.name,
          color: args.color,
          price: args.price,
          brandId: args.brandId,
          addonsId: args.addonsId,
        }
        cameras.push(NewCamera)
        return NewCamera
      },
    },
    addAddon: {
      type: AddonType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLInt },
        brandId: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        const NewAddon = {
          id: addons.length + 1,
          name: args.name,
          price: args.price,
          brandId: args.brandId,
        }
        addons.push(NewAddon)
        return NewAddon
      },
    },
    addBrand: {
      type: BrandType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const NewBrand = {
          id: brands.length + 1,
          name: args.name,
        }
        brands.push(NewBrand)
        return NewBrand
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType,
})

const app = express()
app.listen(5000, () => console.log('Server running on port 5000.'))
app.use(
  '/graphiql',
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
)
