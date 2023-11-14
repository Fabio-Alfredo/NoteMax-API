const notesScheme = {
    tittle:{
        type:String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    categories:{
        type: String,
        enum: ['draft', 'math', 'social', 'friends'],
        required: true
    }
}

const validateNotes = (newNote, existingNotes) => {
    
    for (const key in notesScheme) {
        if (notesScheme[key].required && !newNote[key]) {
            return { isValid: false, error: `El campo "${key}" es requerido.` };
        }
    }
    

    if (notesScheme.categories && newNote.categories && !notesScheme.categories.enum.includes(newNote.categories)) {
        return { isValid: false, error: 'El campo "categories" no es válido.' };
    }

    return { isValid: true, error: null };
}


module.exports = {validateNotes};
