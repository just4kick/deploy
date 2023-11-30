const express = require('express');
const { graphql } = require('@octokit/graphql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Choose the port you prefer

app.use(express.json());


const accessToken = process.env.GITHUB_ACCESS_TOKEN;
let errorMessage='';

app.get('/search', async (req, res) => {
  try {
    let { keywords, exclude, readmekey ,range,page} = req.query;

    if(keywords)
    {
      keywords=keywords.trim();
    }
    else{
      errorMessage="keyword Required"
     throw new Error('Keywords Not Found');
    }
    exclude =exclude?exclude.split(',').map(e => e.trim()) :[];
    readmekey=readmekey?readmekey:"";
    range= range?parseInt(range):100;
    page=page?parseInt(page):1;
    const searchQuery=keywords;
    console.log('Searching For ', searchQuery);
    console.log('Excluded keywords ', exclude);

    const repositoriesInfo = await fetchRepositories(searchQuery, exclude, readmekey,range,page);
    const empty={
      message : "No repositories found. Please try using different search keywords."
    }
    if(repositoriesInfo.repositoriesInfo.length===0)
    {
      res.json(empty)
    }else{
    res.json(repositoriesInfo);
    }


  } catch (e) {
    console.log(e);
    res.status(500).json({ error:errorMessage});
  }
});

async function fetchRepositories(searchQuery, exclude, readmekey,range,page) {
  const query = `
    query SearchRepositories($searchQuery: String!, $afterCursor: String ,$range: Int) {
      search(query: $searchQuery, type: REPOSITORY, first: $range, after: $afterCursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ... on Repository {
              name
              primaryLanguage {
                name
              }
              owner {
                login
              }
              url
              description
            }
          }
        }
      }
    }
  `;

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${accessToken}`,
    },
  });

  const repositoriesInfo = [];
  const languageCount = {};
  let c=1;
  async function fetchRepositoriesUpToEnd(afterCursor = null) {
    const response = await graphqlWithAuth(query, { searchQuery, afterCursor,range});

    const repositories = response.search.edges;

    for (const repo of repositories) {
      const name = repo.node.name;
      const language = repo.node.primaryLanguage ? repo.node.primaryLanguage.name : 'N/A';
      const author = repo.node.owner.login;
      const htmlUrl = repo.node.url;
      const description = repo.node.description || 'N/A';
      
      const excludeKeywords = exclude.some((e) => {
        return name.toLowerCase().includes(e.toLowerCase()) && description.toLowerCase().includes(e.toLowerCase());
      });
      if (!excludeKeywords) {
          const readmeLinks = [];
          if(readmekey){
          const readmeContent = await fetchReadmeContent(author, name,graphqlWithAuth);
          if (readmeContent.toLowerCase().includes(readmekey.toLowerCase())) {
            console.log('Keyword ', readmekey, ' true ', name);
            readmeLinks.push(readmeContent.match(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi));
          } else {
            console.log('Keyword ', readmekey, ' false ', name);
          }
        }
          if (language !== 'N/A') {
            if (languageCount[language]) {
              languageCount[language]++;
            } else {
              languageCount[language] = 1;
            }
          }

          repositoriesInfo.push(
            {
            name,
            language,
            author,
            htmlUrl,
            description,
            readmeLinks,
          });
        

      }
    }
    
    if (response.search.pageInfo.hasNextPage && c<page) {
      ++c;
      await fetchRepositoriesUpToEnd(response.search.pageInfo.endCursor);
    }
  }

  await fetchRepositoriesUpToEnd();

  const combinedData = {
    languageCount,
    repositoriesInfo,
  };

  return combinedData;
}

async function fetchReadmeContent(repoOwner, repoName,graphqlWithAuth) {
  const readmeQuery = `
    query GetReadmeContent($repoOwner: String!, $repoName: String!) {
      repository(owner: $repoOwner, name: $repoName) {
        object(expression: "main:README.md") {
          ... on Blob {
            text
          }
        }
      }
    }
  `;

  const response = await graphqlWithAuth(readmeQuery, {
    repoOwner,
    repoName,
  });

  if (response.repository && response.repository.object && response.repository.object.text) {
    return response.repository.object.text;
  } else {
    return '';
  }
}



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
