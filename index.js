
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { uploadData, getData ,getDataByFields,uploadFile} = require('./firebase');
const upload = multer(); 
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


const userschema = {
    type: 'object',
    properties: {
        username: { type: 'string', minLength: 3, maxLength: 30 },
        password: { type: 'string', minLength: 5 },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' }
    },
    required: ['username', 'password', 'email', 'name'],
    additionalProperties: false
};

const validateUserData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    for (const [key, value] of Object.entries(userschema.properties)) {
        if (userSchema.required.includes(key) && (data[key] === undefined || typeof data[key] !== value.type)) {
            return false;
        }
    }

    return true;
};

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
            res.status(404).json({ status: 'error', message: 'User not found' });
        }
    } catch (error) {
        console.error('Unable to get user data', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
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
            res.json({ data: userData[0] });
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
            await uploadData(userData, 'users');
            res.json({ status: 'success', message: 'User signed up successfully' });
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
            res.json({ status: 'success', message: 'User logged in successfully' });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});



app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});