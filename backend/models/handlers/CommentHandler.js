
import Comment from './../databases/comment';

class CommentHandler{

    static deleteComment(req, res){
        const { commentId } = req.params;
        if (!commentId) {
            return res.json({ success: false, error: 'No comment id provided' });
        }
        Comment.remove({ _id: commentId }, (error, comment) => {
            if (error) return res.json({ success: false, error: "unable to remove" });
            return res.json({ success: true });
        });
    }

    static getAllComments(req, res){
        Comment.find((err, comments) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: comments });
          });
    }

    static updateComment(req, res){
        const comment = new Comment();
        // body parser lets us use the req.body
        const { author, text } = req.body;
        if (!author || !text) {
            // we should throw an error. we can do this check on the front end
            return res.json({
            success: false,
            error: 'You must provide an author and comment'
            });
        }
        comment.author = author;
        comment.text = text;
        comment.save(err => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true });
        });
    }

    static getCommentById(req, res){
        const { commentId } = req.params;
        if (!commentId) {
            return res.json({ success: false, error: 'No comment id provided' });
        }
        Comment.findById(commentId, (error, comment) => {
            if (error) return res.json({ success: false, error });
            const { author, text } = req.body;
            if (author) comment.author = author;
            if (text) comment.text = text;
            comment.save(error => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true });
            });
        });
    }
}

export default CommentHandler;