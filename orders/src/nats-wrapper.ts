import stan, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  /**
   * Returns the client
   * @returns Stan
   */
  get client(): Stan {
    if (!this._client) {
      throw new Error('NATs Client not initialized');
    }
    return this._client;
  }

  /**
   * Connects to NATS Streaming server
   * @param clusterId - Cluster ID
   * @param clientId - Client ID
   * @param url - NATS connection URL
   * @returns Promise<void>
   */
  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = stan.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Publisher connected to NATS');
        resolve();
      });

      this.client.on('error', (err) => {
        console.log('Publisher connection error', err);
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
