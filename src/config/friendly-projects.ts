export interface FriendlyProject {
  friendlyName?: string;
  image: string;
}

const friendlyProjects: { [key: string]: FriendlyProject } = {
  'aurora-server': {
    image: ''
  },
  'raven-cli': {
    friendlyName: 'Raven CLI',
    image: ''
  }
};

export default friendlyProjects;
