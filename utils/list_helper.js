const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
  let bestBlog
  blogs.map(blog => {
    if (!bestBlog || blog.likes > bestBlog.likes) {
      bestBlog = blog
    }
  })
  return bestBlog === undefined ? blogs[0] : bestBlog
}

const mostBlogs = (blogs) => {
  let authorObject = {}
  blogs.forEach(blog => {
    const author = blog.author
    if (author in authorObject) {
      authorObject[author] += 1
    } else {
      authorObject[author] = 1
    }
  })
  const bestAuthor = Object.keys(authorObject).reduce((a, b) => authorObject[a] > authorObject[b] ? a : b)
  return { 'author': bestAuthor, 'blogs': authorObject[bestAuthor] }
}

const mostLikes = (blogs) => {
  let authorObject = {}
  blogs.forEach(blog => {
    const author = blog.author
    if (author in authorObject) {
      authorObject[author] += blog.likes
    } else {
      authorObject[author] =  blog.likes
    }
  })
  console.log('authorObject', authorObject)
  const bestAuthor = Object.keys(authorObject).reduce((a, b) => authorObject[a] > authorObject[b] ? a : b)
  return { 'author': bestAuthor, 'likes': authorObject[bestAuthor] }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}