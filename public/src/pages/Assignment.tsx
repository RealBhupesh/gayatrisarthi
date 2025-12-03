import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Assignment = () => {
  const [problem, setProblem] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    sampleInput: '',
    sampleOutput: '',
    constraints: '',
    timeLimit: 1,
    //memoryLimit: 256,
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problem),
      });

      if (!response.ok) {
        throw new Error('Failed to create problem');
      }

      setStatus({ type: 'success', message: 'Problem created successfully!' });
      setProblem({
        title: '',
        description: '',
        difficulty: 'medium',
        sampleInput: '',
        sampleOutput: '',
        constraints: '',
        timeLimit: 1
       // memoryLimit: 256,
      });
    } catch (error) {
      if (error instanceof Error) {
        setStatus({ type: 'error', message: error.message });
      } else {
        setStatus({ type: 'error', message: 'An unknown error occurred.' });
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Problem</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Problem Title</label>
            <Input
              value={problem.title}
              onChange={(e) => setProblem({ ...problem, title: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={problem.description}
              onChange={(e) => setProblem({ ...problem, description: e.target.value })}
              required
              className="w-full h-32 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Difficulty</label>
            <select
              value={problem.difficulty}
              onChange={(e) => setProblem({ ...problem, difficulty: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Sample Input</label>
            <textarea
              value={problem.sampleInput}
              onChange={(e) => setProblem({ ...problem, sampleInput: e.target.value })}
              required
              className="w-full h-24 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Sample Output</label>
            <textarea
              value={problem.sampleOutput}
              onChange={(e) => setProblem({ ...problem, sampleOutput: e.target.value })}
              required
              className="w-full h-24 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Constraints</label>
            <textarea
              value={problem.constraints}
              onChange={(e) => setProblem({ ...problem, constraints: e.target.value })}
              required
              className="w-full h-24 p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Time Limit (seconds)</label>
              <Input
                type="number"
                value={problem.timeLimit}
                onChange={(e) => setProblem({ ...problem, timeLimit: Number(e.target.value) })}
                required
                min="0"
                step="0.1"
              />
            </div>
           
          </div>

          <Button type="submit" className="w-full">
            Create Problem
          </Button>
        </form>

        {status.message && (
          <Alert className={`mt-4 ${status.type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default Assignment;
