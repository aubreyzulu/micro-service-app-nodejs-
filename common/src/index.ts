export type Person = {
  name: string;
  age: number;
};
const number = 2;

function greet(person: Person) {
  return 'Hello ' + person.name;
}

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>;

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
};
export default greet;
