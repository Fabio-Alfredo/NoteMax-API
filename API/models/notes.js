const notesSchema = {
    id: {
        type: String,
        unique: true,
        required: true
    },
    user_id:{
        type: String,
        unique: true,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}



