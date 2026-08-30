import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
const [Name, SetName] = useState("");
const [Email, SetEmail] = useState("");
const [Gender, SetGender] = useState("Laki-laki");
const navigate = useNavigate();

const SaveUser = async (e) =>{
    e.preventDefault();
    try {
        console.log("check", Name, Email, Gender);
        await axios.post('http://localhost:5000/users', {
            name:Name,
            email:Email,
            gender:Gender
        });
        navigate("/");
    } catch (error) {
        console.log(error);
    }
}

  return (
    <div className="columns mt-5 is-centered">
        <div className="column is-half">
            <form onSubmit={SaveUser}>
                <div className="field">
                    <label className="label">Name</label>
                    <div className="control">
                        <input 
                        type="text" 
                        className="input" 
                        value={Name}
                        onChange={(e) => SetName(e.target.value)} 
                        placeholder='Name'
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label">Email</label>
                    <div className="control">
                        <input 
                        type="text" 
                        className="input" 
                        value={Email}
                        onChange={(e) => SetEmail(e.target.value)} 
                        placeholder='Email'
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label">Gender</label>
                    <div className="control">
                       <div className="select is-fullwidth">
                        <select value={Gender}
                        onChange={(e) => SetGender(e.target.value)}>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                       </div>
                    </div>
                </div>
                <div className="field">
                    <button type='submit' className='button is-success'>Save</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default AddUser