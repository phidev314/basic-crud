import { DataTypes, Sequelize} from "sequelize";
import db from "../config/Database.js";

const User = db.define('Users', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.STRING
},{
    freezeTableName:true
})


export default User;

(async()=>{
    await db.sync();
}) ();