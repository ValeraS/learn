import Fetchr from 'fetchr';

export default function servicesCreator(options) {
  const services = new Fetchr(options);

  return {
    readService({ service: resource, params = {} }) {
      return services
        .read(resource)
        .params(params)
        .end()
        .then(({ data }) => data);
    }
  };
}
