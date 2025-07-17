import db from "../database/models/index.js";
const { User } = db;

export const findByEmail = async (email) => {
    try {
        if(!email) return undefined;
        const user = await User.findOne({
            where: { email }
        });
        return user;
    } catch (error) {
        console.log('error finding user by email');
        console.log(error);
        return undefined;
    }
}

export const insertInDb = async (userToCreate) => {
  try {
    if(!userToCreate)return null;
    const createdUser = await db.User.create(userToCreate);
    return createdUser
  } catch (error) {
    console.log(`error inserting user in db`);
    console.log(error);
    return null;
  }
}
