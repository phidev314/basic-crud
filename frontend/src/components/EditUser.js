import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom';

const EditUser = () => {
    const [Name, SetName] = useState("");
    const [Email, SetEmail] = useState("");
    const [Gender, SetGender] = useState("Laki-laki");
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getUserById();
    }, []);

    const UpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://localhost:8000/users/${id}`, {
                name: Name,
                email: Email,
                gender: Gender
            });
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    }

    const getUserById = async () => {
        const response = await axios.get(`http://localhost:8000/users/${id}`);
        SetName(response.data.Name);
        SetEmail(response.data.Email);
        SetGender(response.data.Gender);
    }

    return (
        <div className="columns mt-5 is-centered">
            <div className="column is-half">
                <form onSubmit={UpdateUser}>
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
                        <button type='submit' className='button is-success'>Update</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditUser