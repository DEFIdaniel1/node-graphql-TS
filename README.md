# node-graphql-TS

Node project written in TypeScript that connects to a mongoDB database via mongoose. APIs are setup using graphQL.

<h2>Overview</h2>
Project is meant to mimic a social media site database. Users can be created, login, and post content. Content includes: title, content body, imageUrl. These can be edited and deleted.

The database houses User models that connect to the Post model via a posts array. 

Resolvers include:
<li>Create user</li>
<li>Login with authentication</li>
<li>User (checks for existing user)</li>
<li>editUser</li>
<li>deleteUser</li>
<li>createPost</li>
<li>updatePost</li>
<li>deletePost</li>

<br>

Remaining to dos: finish testing the auth middleware, app, file upload, and convert resolvers to TS.
