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

afterAll(() => {
  mongoose.connection.close()
})