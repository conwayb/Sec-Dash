<template>
  <div class="dashboard">

    <!--<h1>Dashboard</h1> -->

    <v-container class="my-5">

      <v-layout row justify-start class="mb-3">
          <!-- Sort By Project Name -->
          <v-tooltip top>
             <v-btn small flat color="grey" @click="sortBy('name')" slot="activator">
               <v-icon small left>folder</v-icon>
               <span class="caption text-lowercase">By project names</span>
             </v-btn>
             <span>Sort projects by project title</span>
          </v-tooltip>
           <!-- Sort By Owner -->
           <v-tooltip top>
             <v-btn small flat color="grey" @click="sortBy('gitHubData.login')" slot="activator">
               <v-icon small left>person</v-icon>
               <span class="caption text-lowercase">By Owner</span>
             </v-btn>

             <span>Sort projects by owner</span>
          </v-tooltip>
           <!-- Sort By Vulnerability -->
           <v-tooltip top>
             <v-btn small flat color="grey" @click="sortBy('status')" slot="activator">
               <v-icon small left>security</v-icon>
               <span class="caption text-lowercase">By Vulnerability</span>
             </v-btn>
             <span>Sort projects by vulnerability</span>
          </v-tooltip>
        </v-layout>



        <!-- Data Dashboard -->
        <div v-if="$apollo.loading">Loading...</div>
        <div v-else>
          <v-card flat v-for="repo in gitHubData.repositories.edges" :key="repo.node.id">
              <v-layout row wrap :class="`pa-3 project ${gitHubData.login}`">


                  <!-- Project Title Column -->
                  <v-flex xs12 md4>
                    <div class="caption grey--text">Project title</div>
                    <div>{{ repo.node.name }}</div>
                  </v-flex>



                  <v-flex xs6 sm4 md2>
                    <div class="caption grey--text">Owner</div>
                    <div>{{ gitHubData.login }}</div>
                  </v-flex>


                  <!-- Project Date Column-->
                  <v-flex xs6 sm4 md2>
                    <div class="caption grey--text">Created</div>
                    <div>{{ repo.node.createdAt }}</div>
                  </v-flex>

                  <!-- Project Modified Column-->
                  <v-flex xs6 sm4 md2>
                    <div class="caption grey--text">Pushed to</div>
                    <div>{{ repo.node.pushedAt }}</div>
                  </v-flex>

                  <!-- Project Vulnerability-->
                  <v-flex xs2 sm4 md2>
                    <div class="right">
                      <v-chip small
                        :class="`${ getHighestSeverityForRepo(repo.node) }`"
                        class="white--text my-2 caption">
                        {{ getHighestSeverityForRepo(repo.node) }}
                      </v-chip>
                    </div>
                  </v-flex>


                </v-layout>
        <!--      For Spacing Columns -->
                <v-divider></v-divider>
              </v-card>
              </div>
        </v-container>

    </div>

</template>

<script>
import { gql } from "apollo-boost";
  export default {
    data: function() {
      return {
        // Dummy Data
        lastPushedTo: 730,
        projects: [
          {status: 'critical'},
          {status: 'moderate'},
          {status: 'low'},
        ],
        severity_rank: {
          'LOW': 0,
          'MODERATE': 1,
          'HIGH': 2,
          'CRITICAL': 3
        },
        gitHubData: [],
      }
    },
    apollo: {
      // Query to update viewer data
      gitHubData: {
        query: gql`  {
          gitHubData: repositoryOwner(login:"PSU-OIT-ARC") {
            login
            url
            repositories(first: 50, orderBy:{ field: PUSHED_AT, direction: DESC}) {
              edges {
                node {
                  id
                  name
                  createdAt
                  pushedAt
                  vulnerabilityAlerts(first:20) {
                    edges {
                      node {
                        securityAdvisory {
                          severity
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`
      }
    },
    methods: {
      // Method takes a string and sorts for our table
      sortBy(prop) {
        this.gitHubData.sort((a,b) => a[prop] < b[prop] ? -1 : 1)
      },
      getHighestSeverityForRepo(repo) {
        let severities = repo.vulnerabilityAlerts.edges.map(e=> {
          return e.node.securityAdvisory.severity
        })
        severities.sort((a,b) => {
          return this.severity_rank[a] < this.severity_rank[b]
        })
        return severities[0];
      }
    },
  }
</script>


<!-- Data Dashboard Styles -->
<style>
.project.PSU-OIT-ARC{
  border-left: 4px solid #3CD1C2;
}
.project.moderate{
  border-left: 4px solid #ffaa2c;
}
.project.critical{
  border-left: 4px solid #f83e70;
}
.v-chip.PSU-OIT-ARC{
  background: #3cd1c2;
}
.v-chip.moderate, .v-chip.MODERATE {
  background: #ffaa2c;
}
.v-chip.critical, .v-chip.HIGH {
  background: #f83e70;
}
</style>
