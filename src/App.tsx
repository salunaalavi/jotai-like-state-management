import {
  atom,
  useAtom,
} from "./store";

type TArray = {
  [x: string]: string
}[]

const array: TArray = Array(1000).fill(1).map((_, i: number) => (
  {
    [`first-${i}`]: "",
    [`last-${i}`]: ""
  }
))

const storeAtom = atom<TArray>(array);

const TextInput = ({ value, index }: { value: keyof TArray[number], index: number }) => {
  const [fieldValue, setStore] = useAtom(storeAtom, (store) => store[index][value]);

  return (
    <div className="field">
      {value}:{" "}
      <input
        value={fieldValue as string}
        onChange={(e) => setStore((store) => {
          store[index][value] = e.target.value;
          return store;
        })}
      />
    </div>
  );
};

const Display = ({ value, index }: { value: keyof TArray[number], index: number }) => {
  const [fieldValue] = useAtom(storeAtom, (store) => store[index][value]);
  return (
    <div className="value">
      {value}: {fieldValue as string}
    </div>
  );
};

const FormContainer = () => {
  const [state] = useAtom(storeAtom);

  return (
    <div className="container">
      <h5>FormContainer</h5>
      {
        state.map((_, i) => (
          <div key={`text-input-${i}`}>
            <TextInput key={`first-${i}`} value={`first-${i}`} index={i} />
            <TextInput key={`last-${i}`} value={`last-${i}`} index={i} />
          </div>
        ))
      }
    </div>
  );
};

const DisplayContainer = () => {
  const [state] = useAtom(storeAtom);

  return (
    <div className="container">
      <h5>DisplayContainer</h5>
      {
        state.map((_, i) => (
          <div key={`display-input-${i}`}>
            <Display key={`display-first-${i}`} value={`first-${i}`} index={i} />
            <Display key={`display-last-${i}`} value={`last-${i}`} index={i} />
          </div>
        ))
      }
    </div>
  );
};

const ContentContainer = () => {
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <FormContainer />
      <DisplayContainer />
    </div>
  );
};

function App() {
  return (
    <div className="container">
      <h5>App</h5>
      <ContentContainer />
    </div>
  );
}

export default App;
