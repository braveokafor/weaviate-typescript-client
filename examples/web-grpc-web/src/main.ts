import weaviate, { ApiKey } from 'weaviate-client/web-grpc';
import type { WeaviateNonGenericObject } from 'weaviate-client/web-grpc';
import './style.css';

const form = document.querySelector<HTMLFormElement>('#form')!;
const output = document.querySelector<HTMLDivElement>('#output')!;
const readField = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)!.value.trim();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void runQuery();
});

async function runQuery(): Promise<void> {
  output.textContent = 'Connecting...';

  const apikey = readField('apikey');
  try {
    const client = await weaviate.connectToLocal({
      host: readField('host'),
      port: Number(readField('httpPort')),
      grpcPort: Number(readField('grpcPort')),
      authCredentials: apikey ? new ApiKey(apikey) : undefined,
      skipInitChecks: true,
    });

    output.textContent = 'Fetching objects...';
    const result = await client.collections
      .use(readField('collection'))
      .query.fetchObjects({ limit: Number(readField('limit')) });

    renderObjects(result.objects);
  } catch (err) {
    output.textContent = `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function renderObjects(objects: WeaviateNonGenericObject[]): void {
  output.innerHTML = '';

  const summary = document.createElement('p');
  summary.textContent = `${objects.length} object${objects.length === 1 ? '' : 's'}`;
  output.appendChild(summary);

  const list = document.createElement('ul');
  list.className = 'results';
  for (const obj of objects) {
    const item = document.createElement('li');
    const id = document.createElement('code');
    id.textContent = obj.uuid;
    item.appendChild(id);
    const props = document.createElement('pre');
    props.textContent = JSON.stringify(obj.properties, null, 2);
    item.appendChild(props);
    list.appendChild(item);
  }
  output.appendChild(list);
}
