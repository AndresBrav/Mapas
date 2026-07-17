import { describe, it, expect, vi } from 'vitest';

// Mock de ultimate-express
vi.mock('ultimate-express', () => {
  const mockRouter = { use: vi.fn(), post: vi.fn(), get: vi.fn() };
  return { default: { Router: () => mockRouter } };
});

// Mock de controllers y middleware
vi.mock('../../../src/controllers/health.controller.js', () => ({ healthController: vi.fn() }));
vi.mock('../../../src/controllers/example.controller.js', () => ({
  createExampleController: vi.fn(),
  getExampleController: vi.fn()
}));
vi.mock('../../../src/controllers/geo.controller.js', () => ({
  geocodeController: vi.fn(),
  routeController: vi.fn()
}));
vi.mock('../../../src/middleware/validate.middleware.js', () => ({
  validateRequestMiddleware: {
    createExample: vi.fn(() => 'createValidator'),
    getExample: vi.fn(() => 'getValidator'),
    geocode: vi.fn(() => 'geocodeValidator'),
    route: vi.fn(() => 'routeValidator'),
  }
}));

vi.mock('../../../src/middleware/auth.middleware.js', () => ({
  authMiddleware: vi.fn(),
}));

describe('router.routes.js', () => {
  it('should register the POST and GET routes of the example resource and geocode route', async () => {
    const { default: router } = await import('../../../src/routes/router.routes.js');

    expect(router.use).toHaveBeenCalled();
    expect(router.post).toHaveBeenCalledWith('/examples', expect.anything(), expect.anything());
    expect(router.get).toHaveBeenCalledWith('/examples/:id', expect.anything(), expect.anything());
    expect(router.post).toHaveBeenCalledWith('/geo/geocode', expect.anything(), expect.anything());
    expect(router.post).toHaveBeenCalledWith('/geo/route', expect.anything(), expect.anything());
  });
});
