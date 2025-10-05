
// Comment creation interface
export interface CommentCreateData {
  content: string;
  blogId: string;
}

export const createComment = async (data: CommentCreateData): Promise<any> => {
    console.log('Faking comment creation with data:', data);

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            const newComment = {
                id: new Date().getTime().toString(), // Fake ID
                ...data,
                authorName: 'Current User',
                createdAt: new Date().toISOString(),
            };
            console.log('Simulated comment creation successful.');
            resolve({ success: true, data: newComment });
        }, 300);
    });
};
export const getCommentByBlogId = async (id: string): Promise<{ data: any[] }> => {
    console.log(`Fetching fake comments for blogId: ${id}`);

    const fakeComments = [
        {
            id: 'comment-1',
            content: 'Bài viết rất hữu ích, cảm ơn bạn!',
            authorName: 'Nguyễn Văn A',
            createdAt: '2024-08-21T10:30:00Z',
            blogId: id,
        },
        {
            id: 'comment-2',
            content: 'Tôi đã thử và thành công. Cảm ơn hướng dẫn chi tiết.',
            authorName: 'Trần Thị B',
            createdAt: '2024-08-21T11:00:00Z',
            blogId: id,
        },
    ];

    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: fakeComments });
        }, 400);
    });
};
