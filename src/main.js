// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import Vue from 'vue'
import VueApollo from 'vue-apollo'
import App from './App'
import router from './router'
import 'tachyons'
import { GC_USER_ID, GC_AUTH_TOKEN } from './constants/settings'

Vue.config.productionTip = false

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'https://api.graph.cool/simple/v1/cjs31m8me4kok0102bpw6if2u'
})

const wsClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/cjs31m8me4kok0102bpw6if2u', {
  reconnect: true,
  connectionParams: {
    authToken: localStorage.getItem(GC_AUTH_TOKEN)
  }
})

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const token = localStorage.getItem(GC_AUTH_TOKEN)
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  })

  return forward(operation)
})

const httpLinkWithSubscriptions = addGraphQLSubscriptions(
  authMiddleware.concat(httpLink),
  wsClient
)

const apolloClient = new ApolloClient({  
  link: httpLinkWithSubscriptions,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $loadingKey: 'loading'
  }
})

let userId = localStorage.getItem(GC_USER_ID)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  router,
  data: {
    userId //set userId on the $root $data object
  },
  components: { App },
  template: '<App/>'
})
