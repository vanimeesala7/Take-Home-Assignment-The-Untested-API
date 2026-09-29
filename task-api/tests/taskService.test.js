const taskService = require('../src/services/taskService');

describe('taskService', () => {
    beforeEach(() => {
        taskService._reset();
    });

    it('should create a task with default values', () => {
        const task = taskService.create({ title: 'Learn Jest' });
        expect(task).toHaveProperty('id');
        expect(task.title).toBe('Learn Jest');
        expect(task.description).toBe('');
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('medium');
        expect(task.dueDate).toBeNull();
        expect(task.completedAt).toBeNull();
        expect(task).toHaveProperty('createdAt');
    });
    it('should return all tasks', () => {
        taskService.create({ title: 'Task 1' });
        taskService.create({ title: 'Task 2' });
        const tasks = taskService.getAll();
        expect(tasks).toHaveLength(2);
        expect(tasks[0].title).toBe('Task 1');
        expect(tasks[1].title).toBe('Task 2');
    });
    
    it('should find a task by id', () => {
        const createdTask = taskService.create({ title: 'Find me' });
        const task = taskService.findById(createdTask.id);
        expect(task).toBeDefined();
        expect(task.title).toBe('Find me');
    });
    it('should return tasks by status', () => {
        taskService.create({ title: 'Todo task', status: 'todo' });
        taskService.create({ title: 'Progress task', status: 'in_progress' });
        taskService.create({ title: 'Done task', status: 'done' });
        const tasks = taskService.getByStatus('todo');
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe('Todo task');
    });
    it('should return paginated tasks', () => {
        taskService.create({ title: 'Task 1' });
        taskService.create({ title: 'Task 2' });
        taskService.create({ title: 'Task 3' });
        const tasks = taskService.getPaginated(1, 2);
        expect(tasks).toHaveLength(2);
        expect(tasks[0].title).toBe('Task 1');
        expect(tasks[1].title).toBe('Task 2');
    });
    it('should return task statistics', () => {
  taskService.create({ title: 'Todo task', status: 'todo' });
  taskService.create({ title: 'Progress task', status: 'in_progress' });
  taskService.create({ title: 'Done task', status: 'done' });

  const stats = taskService.getStats();

  expect(stats.todo).toBe(1);
  expect(stats.in_progress).toBe(1);
  expect(stats.done).toBe(1);
  expect(stats.overdue).toBe(0);
});
it('should count overdue incomplete tasks', () => {
  taskService.create({
    title: 'Overdue task',
    status: 'todo',
    dueDate: '2020-01-01',
  });

  taskService.create({
    title: 'Completed old task',
    status: 'done',
    dueDate: '2020-01-01',
  });

  const stats = taskService.getStats();

  expect(stats.overdue).toBe(1);
});

it('should update an existing task', () => {
  const createdTask = taskService.create({
    title: 'Old title',
  });

  const updatedTask = taskService.update(createdTask.id, {
    title: 'New title',
    priority: 'high',
  });

  expect(updatedTask.title).toBe('New title');
  expect(updatedTask.priority).toBe('high');
  expect(updatedTask.id).toBe(createdTask.id);
});
it('should return null when updating a non-existent task', () => {
  const updatedTask = taskService.update('non-existent-id', {
    title: 'New title',
  });

  expect(updatedTask).toBeNull();
});
it('should remove an existing task', () => {
  const createdTask = taskService.create({
    title: 'Delete me',
  });

  const result = taskService.remove(createdTask.id);

  expect(result).toBe(true);
  expect(taskService.findById(createdTask.id)).toBeUndefined();
});
it('should return false when removing a non-existent task', () => {
  const result = taskService.remove('non-existent-id');

  expect(result).toBe(false);
});

it('should complete an existing task', () => {
  const createdTask = taskService.create({
    title: 'Complete me',
    priority: 'high',
    status: 'in_progress',
  });

  const completedTask = taskService.completeTask(createdTask.id);

  expect(completedTask.status).toBe('done');
  expect(completedTask.completedAt).not.toBeNull();
});
it('should return null when completing a non-existent task', () => {
  const result = taskService.completeTask('non-existent-id');

  expect(result).toBeNull();
});
});
