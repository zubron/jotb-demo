import argparse
import json
import random
import time

import requests


class TodoSimulator:
    def __init__(self, host):
        self.host = host
        self.todos = []
        self.todo_count = 0
    
    def get_todos(self):
        try:
            r = requests.get(self.host + '/api/todos')
            r.raise_for_status()
            self.todos = json.loads(r.text)
        except Exception as e:
            print('Error retrieving todos: {error}'.format(error=e))
    
    def get_single_todo(self):
        if len(self.todos) == 0:
            return

        try:
            item_to_get = random.choice(self.todos)
            r = requests.get('{host}{route}/{id}'.format(
                host=self.host, route='/api/todos', id=item_to_get['_id']))
            r.raise_for_status()
        except Exception as e:
            print('Error retrieving todo: {error}'.format(error=e))

    def create_todo(self):
        try:
            item = 'ToDo item #{number}'.format(number=self.todo_count)
            r = requests.post(self.host + '/api/todos', data={'text': item})
            r.raise_for_status()
            self.todos = json.loads(r.text)
            self.todo_count += 1
        except Exception as e:
            print('Error creating todo: {error}'.format(error=e))
        pass
    
    def delete_todo(self):
        if len(self.todos) == 0:
            return

        try:
            item_to_delete = random.choice(self.todos)
            r = requests.delete('{host}{route}/{id}'.format(
                host=self.host, route='/api/todos', id=item_to_delete['_id']))
            r.raise_for_status()
            self.todos = json.loads(r.text)
        except Exception as e:
            print('Error deleting todo: {error}'.format(error=e))

    def delete_all(self):
        while len(self.todos) > 0:
            self.delete_todo()

    def nonexistent(self):
        try:
            r = requests.get(self.host + '/doesnotexist')
            r.raise_for_status()
        except Exception as e:
            print('Expected error occurred: {error}'.format(error=e))

    def simulate(self, chance_boundaries):
        while True:
            choice = random.random()
            if choice < chance_boundaries['get_all']:
                # Get all todos
                self.get_todos()
            elif choice < chance_boundaries['get_single']:
                # Get a specific todo
                self.get_single_todo()
            elif choice < chance_boundaries['create']:
                # Create a todo
                self.create_todo()
            elif choice < chance_boundaries['delete']:
                # Delete a todo
                self.delete_todo()
            else:
                self.nonexistent()
            time.sleep(0.1 * random.random())


if __name__=="__main__":
    parser = argparse.ArgumentParser(
        description='Simulate requests to the ToDo API')
    parser.add_argument('host', type=str)
    args = parser.parse_args()

    todo_sim = TodoSimulator(args.host)
    chance_boundaries = {
        'get_all': 0.6,
        'get_single': 0.7,
        'create': 0.84,
        'delete': 0.98
    }
    todo_sim.simulate(chance_boundaries)
