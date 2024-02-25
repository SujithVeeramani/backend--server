
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { uploadData, getData ,getDataByFields,uploadFile} = require('./firebase');
const upload = multer(); 
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    const routes = app._router.stack
        .filter((r) => r.route)
        .filter((r) => !r.route.path.startsWith('/front/'))
        .map((r) => ({ path: r.route.path, methods: Object.keys(r.route.methods) }));

    const html = `
        <html>
        <head>
            <title>Available Endpoints</title>
        </head>
        <body>
            <h1>Available Endpoints</h1>
            
            <ul>
                ${routes
                    .map(
                        (route) =>
                            `<li><strong>${route.methods.join(', ')}:</strong> <a href="${route.path}">${route.path}</a></li>`
                    )
                    .join('')}
            </ul>
            <h3>replace :username with user names</h3>
            <h4>to get sample usernames try <u>/users</u> api call </h4>
            <h5>sample username: virat</h5>



            <p> API wriiten by Sujith V L</p>
        </body>
        </html>
    `;

    res.send(html);
});
app.get('/users', async (req, res) => {

        try {
            const data = await getData('users');
            res.json({ status: 'success', data });
        } catch (error) {
            console.log('unable to user the data', error);
    }
});

app.get('/users/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const userData = await getDataByFields('users', { fieldName: 'username', fieldValue: username });

        if (userData.length > 0) {
            res.json({ data: userData[0] });
        } else {
            res.json({ status: 'error', message: 'User not found' ,data:userData});
        }
    } catch (error) {
        console.error('Unable to get user data', error);
        res.json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const data = await getData('posts');
        res.json({ status: 'success', data });
    } catch (error) {
        console.log('unable to get the data', error);
}
});

app.get('/users/:username/posts', async (req, res) => {
    try {
        const username = req.params.username;
        const userData = await getDataByFields('posts', { fieldName: 'username', fieldValue: username });

        if (userData.length > 0) {
            res.json({ data: userData });
        } else {
            res.status(404).json({ status: 'error', message: 'User not found' });
        }
    } catch (error) {
        console.error('Unable to get user data', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});




app.post('/users/:username/add-post', upload.single('photo'), async (req, res) => {
    try {
        const { description, tags } = req.body;
        const username = req.params.username;

        if (!req.file || !description || !tags) {
            return res.status(400).json({ status: 'error', message: 'Incomplete post data' });
        }

        const photoFile = req.file; 

        const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000000)}.jpg`;

        const storagePath = `posts/${uniqueFileName}`;

        const urlforpost = await uploadFile(photoFile, storagePath);

        if (urlforpost != null) {
            const postData = {
                photoname:uniqueFileName,
                photoPath: storagePath,
                description,
                tags,
                username,
                download_url: urlforpost 
            };

             await uploadData(postData, 'posts');

            res.json({ status: 'success', message: 'Post created successfully' });
        } else {
            res.status(500).json({ status: 'error', message: 'Error uploading image' });
        }
    } catch (error) {
        console.error('Unable to create post', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        const existingUserData = await getDataByFields('users', { fieldName: 'username', fieldValue: userData.username });

        if (existingUserData.length === 0) {
            const usrdata = await uploadData(userData, 'users');
            console.log(usrdata);
            res.json({ status: 'success', message: 'User signed up successfully' ,data:usrdata});
        } else {
            res.status(400).json({ status: 'error', message: 'Username already taken' });
        }
    } catch (error) {
        console.error('Error during user signup:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userData = await getDataByFields('users', { fieldName: 'username', fieldValue: username });

        if (userData.length > 0 && userData[0].password === password) {
            res.json({ status: 'success', message: 'User logged in successfully',data:userData });
        } else {
            res.json({ status: 'error', message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});







app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});