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

afterAll(() => {
  mongoose.connection.close()
})