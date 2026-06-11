import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../components/TaskForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe('TaskForm', () => {
  it('renders all form fields', () => {
    render(<TaskForm onSubmit={jest.fn()} submitLabel="Create Task" />);

    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional description')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows validation error when title is empty on submit', async () => {
    render(<TaskForm onSubmit={jest.fn()} submitLabel="Create Task" />);

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={mockSubmit} submitLabel="Create Task" />);

    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: 'My Test Task' },
    });

    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My Test Task' })
      );
    });
  });

  it('pre-fills form with defaultValues', () => {
    render(
      <TaskForm
        onSubmit={jest.fn()}
        submitLabel="Save Changes"
        defaultValues={{
          title: 'Prefilled Task',
          description: 'Prefilled description',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
        }}
      />
    );

    expect(screen.getByDisplayValue('Prefilled Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Prefilled description')).toBeInTheDocument();
  });
});
