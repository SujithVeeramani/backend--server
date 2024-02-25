const { initializeApp } = require('firebase/app');
const { addDoc, collection, getFirestore ,getDocs,query ,where } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');


const firebaseConfig = {
    apiKey: "AIzaSyD8CbscY_8RQ4OmXQ6_0xtMm5_Nvdol3Pk",
    authDomain: "socialmedia-555d5.firebaseapp.com",
    projectId: "socialmedia-555d5",
    storageBucket: "socialmedia-555d5.appspot.com",
    messagingSenderId: "203861038956",
    appId: "1:203861038956:web:3393cf218dd0f5eefac549"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadData = async (data, collectionName) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log('Document written with ID: ', docRef.id);
    } catch (e) {
        console.error('Error adding document: ', e);
    }
};

const getData = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      let documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } 
    catch (err) {
      console.error("Error getting documents:", err);
      throw err;
    }
  };

const getDataByFields = async (collectionName, fields) => {
    try {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(query(collectionRef, where(fields.fieldName, '==', fields.fieldValue)));

        const data = [];

        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return data;
    } catch (error) {
        console.error('Error getting documents by fields: ', error);
        throw error;
    }
};

const uploadFile = async (file, path) => {
    const storage = getStorage();
    const storageRef = ref(storage, path);

    try {
        const snapshot = await uploadBytes(storageRef, file.buffer);

        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File uploaded successfully. Download URL:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        return 'fail';
    }
};

module.exports = {
    uploadData,getData,getDataByFields,uploadFile,
};