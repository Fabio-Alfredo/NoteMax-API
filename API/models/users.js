
const userScheme =
{
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "megaAdmin"],
        required: true
    }
}

const validateUser = (newUser, existingUsers) => {
    for (const key in userScheme) {
        if (userScheme[key].required && !newUser[key]) {
            return { isValid: false, error: `El campo "${key}" es requerido.` };
        }
    }

    if (existingUsers.some(user => user.id === newUser.id)) {
        return { isValid: false, error: 'El campo "id" debe ser único.' };
    }

    if (existingUsers.some(user => user.email === newUser.email)) {
        return { isValid: false, error: 'El campo "email" debe ser único.' };
    }

    if (userScheme.role && newUser.role && !userScheme.role.enum.includes(newUser.role)) {
        return { isValid: false, error: 'El campo "role" no es válido.' };
    }

    return { isValid: true, error: null };
};


module.exports = { validateUser };
