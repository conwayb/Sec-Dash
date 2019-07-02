<template>
  <div class="dashboard">

    <!--<h1>Dashboard</h1> -->

    <v-container class="my-5">
      <v-layout row justify-start class="mb-3">
          <!-- Sort By Project Name -->
          <v-tooltip top>
             <v-btn small flat color="grey" slot="activator"
                @click="sortBy('name')">
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
             <v-btn small flat color="grey" @click="sortBy('highest_severity')" slot="activator">
               <v-icon small left>security</v-icon>
               <span class="caption text-lowercase">By Vulnerability</span>
             </v-btn>
             <span>Sort projects by vulnerability</span>
          </v-tooltip>
        </v-layout>



        <!-- Data Dashboard -->
        <div v-if="$apollo.loading">Loading...</div>
        <div v-else>
          <v-card flat v-for="repo in repositoryData" :key="repo.node.id">
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
                        :class="`${ severity_name(repo.node.highest_severity) }`"
                        class="white--text my-2 caption">
                        {{ severity_name(repo.node.highest_severity) }}
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
        sort_direction: {
          'name': 1,
          'highest_severity': -1
        },
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
          if (this.sort_direction[prop] > 0) {
            this.repositoryData.sort(
              (a,b) => a.node[prop] > b.node[prop])
          }
          else {
            this.repositoryData.sort(
              (a,b) => a.node[prop] < b.node[prop])
          }
          this.sort_direction[prop] = -1 * this.sort_direction[prop]
      },
      getHighestSeverityForRepo(repo) {
        let severities = repo.vulnerabilityAlerts.edges.map(e=> {
          return e.node.securityAdvisory.severity
        })
        severities.sort((a,b) => {
          return this.severity_rank[a] < this.severity_rank[b]
        })
        let severity = severities[0] ? this.severity_rank[severities[0]] : -1
        return severity;
      },
      severity_name(severity) {
        let name =  Object.keys(this.severity_rank).find(
          key => this.severity_rank[key] == severity)
        name = name ? name : "None"
        return name;
      }
    },
    computed: {
      repositoryData () {
        let data = this.gitHubData.repositories.edges;
        data.forEach((repo) => {
        repo.node['highest_severity'] = this.getHighestSeverityForRepo(repo.node)
        });
        return data;
      }
    }
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
.v-chip.None {
  background: green
}
</style>
