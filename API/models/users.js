
const userScheme =
{
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
    },
    phone_number: {
        type: String,
        unique: true,
        required: true
    }
}

const validateUser = (newUser, existingUsers) => {
    for (const key in userScheme) {
        if (userScheme[key].required && !newUser[key]) {
            return { isValid: false, error: `El campo "${key}" es requerido.` };
        }
    }

    if (existingUsers && existingUsers.some(user => user.user === newUser.user)) {
        return { isValid: false, error: 'El campo "user" debe ser único.' };
    }

    if (existingUsers && existingUsers.some(user => user.phone_number === newUser.phone_number)) {
        return { isValid: false, error: 'El campo "phone_number" debe ser único.' };
    }

    else if (existingUsers && existingUsers.some(user => user.email === newUser.email)) {
        return { isValid: false, error: 'El campo "email" debe ser único.' };
    }

    else if (userScheme.role && newUser.role && !userScheme.role.enum.includes(newUser.role)) {
        return { isValid: false, error: 'El campo "role" no es válido.' };
    }

    return { isValid: true, error: null };
};


module.exports = { validateUser };
