using Uno;
using Uno.Graphics;
using Uno.UX;
using Fuse;
using Fuse.Resources;
using Fuse.Controls;
using Fuse.Elements;
using Fuse.Triggers;

public class WhileImageLoaded: WhileTrigger
{
        Image _image;

        protected override void OnRooted(Node parentNode)
        {       
                base.OnRooted(parentNode);
                _image = parentNode as Image;
                _image.Source.Changed += OnSourceChanged;
                OnSourceChanged(null, null);
        }

        void OnSourceChanged(object s, object a)
        {
                if (_image.Source.State == Fuse.Resources.ImageSourceState.Ready) {
                        SetActive(true);
                        RemoveHandler();
                }
        }

        void RemoveHandler()
        {
                if (_image != null) {
                        _image.Source.Changed -= OnSourceChanged; 
                        _image = null;
                }
        }

        protected override void OnUnrooted(Node parentNode)
        {
                RemoveHandler();
                base.OnUnrooted(parentNode);
        }
}
