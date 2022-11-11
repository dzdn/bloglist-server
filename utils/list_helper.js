const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favorite = (blogs) => {

  return blogs.length === 0
    ? null
    : blogs.reduce((prev, current) => {
        return (prev.likes > current.likes) ? prev : current
    })
}

module.exports = {
  dummy,
  totalLikes,
  favorite
}