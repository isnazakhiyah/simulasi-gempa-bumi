import { useNavigate } from 'react-router-dom';
import { ScenarioSelectionPage } from '@simulasi-gempa/ui';
import {
  createCustomScenario,
  createScenarioFromEvent,
} from '../api/scenarios';

type CatalogEventLike = {
  id: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lon?: number;
  regionLabel?: string;
  title?: string;
};

export default function ScenarioSelectionPageContainer() {
  const navigate = useNavigate();

  async function handleSelectCatalogEvent(eventItem: CatalogEventLike) {
    try {
      const lat = Number(eventItem.latitude ?? eventItem.lat);
      const lon = Number(eventItem.longitude ?? eventItem.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error('Latitude/longitude event tidak valid');
      }

      const scenario = await createScenarioFromEvent({
        eventId: eventItem.id,
        title: `Skenario dari ${eventItem.regionLabel ?? eventItem.title ?? 'event nyata'}`,
        target: {
          lat,
          lon,
          label: eventItem.regionLabel ?? 'Same as epicenter (ubah nanti)',
        },
        buildingProfile: 'simple_reinforced_concrete',
        siteFactor: 1,
      });

      navigate(`/simulasi/parameter?scenarioId=${scenario.id}`);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Gagal membuat skenario dari event katalog',
      );
    }
  }

  async function handleCreateCustomScenario() {
    try {
      const scenario = await createCustomScenario({
        title: 'Skenario Custom Baru',
        epicenter: {
          lat: -7.9,
          lon: 110.35,
        },
        target: {
          lat: -7.7956,
          lon: 110.3695,
          label: 'Yogyakarta',
        },
        magnitude: 6.5,
        depthKm: 10,
        buildingProfile: 'non_reinforced_masonry',
        siteFactor: 1,
      });

      navigate(`/simulasi/parameter?scenarioId=${scenario.id}`);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Gagal membuat skenario custom',
      );
    }
  }

  return (
    <ScenarioSelectionPage
      onSelectCatalogEvent={handleSelectCatalogEvent}
      onCreateCustomScenario={handleCreateCustomScenario}
    />
  );
}