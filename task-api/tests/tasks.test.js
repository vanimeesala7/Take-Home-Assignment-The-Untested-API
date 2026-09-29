const request = require('supertest');

const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  // GET /tasks
  it('should return an empty task list initially', async () => {
    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  // POST /tasks
  it('should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Learn API Testing',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Learn API Testing');
    expect(response.body.status).toBe('todo');
    expect(response.body.priority).toBe('medium');
    expect(response.body).toHaveProperty('id');
  });

  // POST edge case
  it('should reject a task without a title', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        description: 'Task without title',
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      'title is required and must be a non-empty string'
    );
  });

  // POST edge case
  it('should reject an invalid status', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Invalid status task',
        status: 'invalid_status',
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      'status must be one of: todo, in_progress, done'
    );
  });

  // GET all
  it('should return all created tasks', async () => {
    await request(app)
      .post('/tasks')
      .send({
        title: 'Task 1',
      });

    await request(app)
      .post('/tasks')
      .send({
        title: 'Task 2',
      });

    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  // GET by status
  it('should return tasks filtered by status', async () => {
    await request(app)
      .post('/tasks')
      .send({
        title: 'Todo task',
        status: 'todo',
      });

    await request(app)
      .post('/tasks')
      .send({
        title: 'Done task',
        status: 'done',
      });

    const response = await request(app)
      .get('/tasks?status=todo');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('todo');
  });

  // Pagination
  it('should return paginated tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    await request(app).post('/tasks').send({ title: 'Task 3' });

    const response = await request(app)
      .get('/tasks?page=1&limit=2');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[1].title).toBe('Task 2');
  });

  // PUT
  it('should update an existing task', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Old title',
      });

    const id = createResponse.body.id;

    const response = await request(app)
      .put(`/tasks/${id}`)
      .send({
        title: 'New title',
        priority: 'high',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('New title');
    expect(response.body.priority).toBe('high');
  });

  // PUT edge case
  it('should return 404 when updating a non-existent task', async () => {
    const response = await request(app)
      .put('/tasks/non-existent-id')
      .send({
        title: 'Updated',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  // DELETE
  it('should delete an existing task', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Delete me',
      });

    const id = createResponse.body.id;

    const response = await request(app)
      .delete(`/tasks/${id}`);

    expect(response.statusCode).toBe(204);

    const getResponse = await request(app).get('/tasks');

    expect(getResponse.body).toHaveLength(0);
  });

  // DELETE edge case
  it('should return 404 when deleting a non-existent task', async () => {
    const response = await request(app)
      .delete('/tasks/non-existent-id');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  // COMPLETE
  it('should complete an existing task', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Complete me',
        status: 'in_progress',
      });

    const id = createResponse.body.id;

    const response = await request(app)
      .patch(`/tasks/${id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).not.toBeNull();
  });

  // COMPLETE edge case
  it('should return 404 when completing a non-existent task', async () => {
    const response = await request(app)
      .patch('/tasks/non-existent-id/complete');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  // STATS
  it('should return task statistics', async () => {
    await request(app)
      .post('/tasks')
      .send({
        title: 'Todo',
        status: 'todo',
      });

    await request(app)
      .post('/tasks')
      .send({
        title: 'Progress',
        status: 'in_progress',
      });

    await request(app)
      .post('/tasks')
      .send({
        title: 'Done',
        status: 'done',
      });

    const response = await request(app)
      .get('/tasks/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(1);
    expect(response.body.done).toBe(1);
    expect(response.body.overdue).toBe(0);
  });

  // ASSIGN
  it('should assign a task to an assignee', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Assign me',
      });

    const id = createResponse.body.id;

    const response = await request(app)
      .patch(`/tasks/${id}/assign`)
      .send({
        assignee: 'Vani',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe('Vani');
    expect(response.body.id).toBe(id);
  });

  // ASSIGN edge case
  it('should return 404 when assigning a non-existent task', async () => {
    const response = await request(app)
      .patch('/tasks/non-existent-id/assign')
      .send({
        assignee: 'Vani',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  // ASSIGN validation
  it('should reject an empty assignee', async () => {
    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Assignment validation',
      });

    const id = createResponse.body.id;

    const response = await request(app)
      .patch(`/tasks/${id}/assign`)
      .send({
        assignee: '',
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toBe(
      'assignee must be a non-empty string'
    );
  });
});