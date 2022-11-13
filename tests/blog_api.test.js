const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('correct number of blogs are returned as JSON', async () => {
  const response = await api.get('/api/blogs')
  expect(response.status).toEqual(200)
  expect(response.type).toEqual("application/json")
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier of blog posts is named id', async () => {
  const blogId = helper.initialBlogs[0]._id
  const resultBlog = await api.get(`/api/blogs/${blogId}`)
  expect(resultBlog.body.id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "A Test Blog",
    author: "Test",
    url: "http://www.test.com",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain("A Test Blog")
})

test('a valid blog added with no likes property sets likes to 0 by default', async () => {
  const newBlog = {
    title: "A Test Blog",
    author: "Test",
    url: "http://www.test.com",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
  
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
})

test('a blog with no title is invalid', async () => {
  const newBlog = {
    author: "Test",
    url: "http://www.test.com",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog with no url is invalid', async () => {
  const newBlog = {
    title: "A Test Blog",
    author: "Test",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a note is deleted if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
  
  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length -1)

  const titles = blogsAtEnd.map(blog => blog.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('a blog is updated with PUT', async () => {
  const blogs = await helper.blogsInDb()
  const blogToUpdate = blogs[0]
  const likes = blogToUpdate.likes
  blogToUpdate.likes = blogToUpdate.likes + 1

  console.log(blogToUpdate)

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[0].likes).toEqual(likes + 1)
})

afterAll(() => {
  mongoose.connection.close()
})