Setting up the project:



After extracting the file, navigate to the "GithubComplexSearchAPI" folder.

1) Open the .env file and insert your GitHub access token, which should resemble:



GITHUB_ACCESS_TOKEN=access_token



Replace 'access_token' with your actual token.



GITHUB_ACCESS_TOKEN=ghp_eOsinIR1Poctu6sLDsejkfhfnlknnlfbbnN



If you wish to change the port, modify <PORT=8010> inside the .env file.



2)Run the following command in the terminal: 

 node index.js



How to use it?



 3)You can use a Visual Studio Code extension like Thunder Client or a web browser to make API requests.



Example query:

http://localhost:8010/search?keywords=misinformation OR disinformation&exclude=game,gaming,games&option=or&range=100&page=2&readmekey=dataset&stict=true



In this query:  



8010 is the port number (change it if you modified the PORT in the .env file).



keywords is a required parameter; keywords must be separated by space or OR/AND.



exclude=game, gaming, games is an optional parameter; exclusions must be separated by commas.



range=100 is an optional parameter with a default value of 100; it specifies the maximum number of repositories in one page (MAX range is 100 repos).



page=2 is an optional parameter with a default value of 1; it specifies the page number.

For instance, 

the maximum range can only be set to 100. If you wish to retrieve 300 repositories, you should set the page parameter to 3. This will fetch the first 100 repositories, followed by the next 100, and so forth. Similarly, if you desire 500 repositories, set the range = 100 and the page = 5. If your requirement is for fewer than 100 repositories, adjust the range = 50, and set the page to 1. (range * page = Number of repositories)



The readmekey=dataset parameter is optional. When specified, the readmekey serves as a keyword for searching within the readme.md file of repositories. If the specified readmekey is found in the readme.md file, the application will return all the links present in that file.

Note: Using the readmekey parameter may result in a longer processing time. It is recommended to employ this feature only when dealing with a smaller number of repositories.


