const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

describe.skip('blog api tests', () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  describe('blogs GET', () => {
    test('should return blogs as json', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsInDatabase = await blogsInDb()

      expect(response.body.length).toBe(blogsInDatabase.length)

      const returnedTitles = response.body.map(blog => blog.title)
      blogsInDatabase.forEach(blog => {
        expect(returnedTitles).toContainEqual(blog.title)
      })
    })
  })

  describe('blogs POST', () => {
    test('should store new blog to db', async () => {
      const newBlog = {
        title: 'SpedeScript',
        author: 'Jani Tarvainen',
        url: 'https://janit.iki.fi/spedescript/',
        likes: 0
      }

      const blogsBefore = await blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfter = await blogsInDb()
      expect(blogsAfter.length).toBe(blogsBefore.length + 1)

      const titles = blogsAfter.map(blog => blog.title)
      expect(titles).toContain(newBlog.title)
    })
    test('should initialize blog likes to zero if likes not provided', async () => {
      const newBlog = {
        title: 'SpedeScript',
        author: 'Jani Tarvainen',
        url: 'https://janit.iki.fi/spedescript/'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await blogsInDb()
      const addedBlog = response.find(blog => blog.title === 'SpedeScript')

      expect(addedBlog.likes).toBe(0)
    })
    test('should respond with status code 400 if title not provided', async () => {
      const newBlog = {
        author: 'Jani Tarvainen',
        url: 'https://janit.iki.fi/spedescript/',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
    test('should respond with status code 400 if url not provided', async () => {
      const newBlog = {
        title: 'SpedeScript',
        author: 'Jani Tarvainen',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
  })

  describe('blogs DELETE', () => {
    let addedBlogDeletable

    beforeEach(async () => {
      addedBlogDeletable = new Blog({
        title: 'Deletable',
        author: 'Del',
        url: 'foo',
        likes: 0
      })
      await addedBlogDeletable.save()
    })
    test('should succeed in deleting with existing id', async () => {
      const blogsBefore = await blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlogDeletable._id}`)
        .expect(204)

      const blogsAfter = await blogsInDb()
      const titles = blogsAfter.map(blog => blog.title)

      expect(titles).not.toContain(addedBlogDeletable.title)
      expect(blogsAfter.length).toBe(blogsBefore.length - 1)
    })
    test('should not succeed in deleting with non-existing id', async () => {
      await api.delete('/api/blogs/123456789').expect(400)
    })
  })

  describe('when there is initially one user at db', async () => {
    beforeAll(async () => {
      await User.remove({})
      const user = new User({ username: 'root', password: 'sekret', isMajor: true })
      await user.save()
    })

    test('should succeed in POST /api/users with a fresh username', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'testi',
        password: 'salainen',
        isMajor: true
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAfter = await usersInDb()
      expect(usersAfter.length).toBe(usersBefore.length + 1)
      const usernames = usersAfter.map(user => user.username)
      expect(usernames).toContain(newUser.username)
    })
    test('should fail in POST /api/users if username already taken', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'root',
        password: 'sekret',
        isMajor: true,
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'username must be unique' })

      const usersAfter = await usersInDb()
      expect(usersAfter.length).toBe(usersBefore.length)
    })
    test('should fail in POST /api/users if password is shorter than 3 characters', async () => {
      const usersBefore = await usersInDb()

      const newUser = {
        username: 'new',
        password: 'bs',
        isMajor: true,
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'password must be at least 3 characters long' })

      const usersAfter = await usersInDb()
      expect(usersAfter.length).toBe(usersBefore.length)
    })
  })

  afterAll(() => {
    server.close()
  })
})
