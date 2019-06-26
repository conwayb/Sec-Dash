import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-boost';

Vue.config.productionTip = false

Vue.use(VueApollo);

// Create Apollo Client
const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  request: operation => {
    operation.setContext({
      headers: {
        Accept: 'application/vnd.github.vixen-preview+json',
        Authorization: 'Bearer ' + ''
      },
    });
  }
});

// Pass client to constructor
const apolloProvider = new VueApollo({
  defaultClient: client,
})

new Vue({
  router,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
