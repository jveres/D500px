using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Resources;
using Fuse.Elements;
using Fuse.Controls;
using Fuse.Triggers;
using WhileLoaded;

public class ImageView: Element
{
        HttpImageSource _source = new HttpImageSource();

        public String ImageUrl
        {
                get { return _source.Url; }
                set { if (_source.Url != value) _source.Url = value; }
        }

        public MemoryPolicy ImageMemoryPolicy
        {
                get { return _source.Policy; }
                set { if (_source.Policy != value) _source.Policy = value; }
        }

        public ImageView()
        {
                CachingMode = CachingMode.Optimized;
        }

        protected override void OnRooted()
        {
                base.OnRooted();
                _source.Changed += OnSourceChanged;
        }

        protected override void OnUnrooted()
        {
                _source.Changed -= OnSourceChanged;
                base.OnUnrooted();
        }

        ImageSourceState _state;
        void OnSourceChanged(object Source, object Args)
        {
                if (_state == _source.State) return; // circumvent Fuse bug here
                _state = _source.State;
                if (_state == ImageSourceState.Ready) UpdateManager.AddDeferredAction(InvalidateVisual);
                WhileLoaded.SetState(this, _state == ImageSourceState.Ready);
                WhileFailed.SetState(this, _state == ImageSourceState.Failed, "Image loading error");
                WhileLoading.SetState(this, _state == ImageSourceState.Loading);
        }

        protected override void OnDraw(DrawContext dc)
        {
                texture2D tex = _source.GetTexture();
                if (tex == null) return;
                draw
                {
                        apply Fuse.Drawing.Planar.Image;
                        DrawContext: dc;
                        Node: this;
                        Size: ActualSize;
                        Texture: tex;
                        BlendEnabled: false;
                };
        }
}