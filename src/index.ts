import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

interface AccountsUser {
  id: string;
  name?: string;
  birthDate?: string;
  username?: string;
}

interface ProductsProduct {
  upc: string;
  name?: string;
  price?: number;
  weight?: number;
  first?: number;
}

interface Review {
  id: string;
  body?: string;
  authorID?: string;
  author?: User;
  product: Product;
}

interface User extends AccountsUser {
  reviews?: Review[];
}

interface Product extends ProductsProduct{
  reviews?: Review[];
}

const typeDefs = gql`
  type Review @key(fields: "id") {
    id: ID!
    body: String
    author: User @provides(fields: "username")
    product: Product
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
    reviews: [Review]
  }
  extend type Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }
`;

const resolvers = {
  Review: {
    author(review: Review) {
      return { __typename: 'User', id: review.authorID };
    },
  },
  User: {
    reviews(user: User) {
      return reviews.filter(review => review.authorID === user.id);
    },
    numberOfReviews(user: User) {
      return reviews.filter(review => review.authorID === user.id).length;
    },
    username(user: User) {
      const found = usernames.find(username => username.id === user.id);
      return found ? found.username : null;
    },
  },
  Product: {
    reviews(product: Product) {
      return reviews.filter(review => review.product.upc === product.upc);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen({ port: 4005 }).then(({ url }) => {
  console.log(`🚀 Reviews service ready at ${url}`);
});

const usernames = [
  { id: '1', username: '@ada' },
  { id: '2', username: '@complete' },
];
const reviews: Review[] = [
  {
    id: '1',
    authorID: '1',
    product: { upc: '1' },
    body: 'Love it!',
  },
  {
    id: '2',
    authorID: '1',
    product: { upc: '2' },
    body: 'Too expensive.',
  },
  {
    id: '3',
    authorID: '2',
    product: { upc: '3' },
    body: 'Could be better.',
  },
  {
    id: '4',
    authorID: '2',
    product: { upc: '1' },
    body: 'Prefer something else.',
  },
];
